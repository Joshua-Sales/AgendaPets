const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const auth = require("../middleware/auth");
const { enviarMensagem } = require("../services/whatsapp");

const db = admin.firestore();

// CREATE
router.post("/", auth, async (req, res) => {
  if (req.user.role !== 'veterinario') {
    return res.status(403).json({ erro: "Apenas veterinários podem realizar agendamentos." });
  }

  const { data, hora, pet_id } = req.body;
  const veterinario_id = req.user.uid; // O veterinário logado é quem atende

  if (!data || !hora || !pet_id) {
    return res.status(400).json({ erro: "Data, hora e pet são obrigatórios." });
  }

  // Converte a string YYYY-MM-DD para um objeto Date (tipo date)
  const [ano, mes, dia] = data.split('-').map(Number);
  const dataObjeto = new Date(ano, mes - 1, dia);

  // Verifica conflito usando o objeto Date
  const conflito = await db.collection("agendamentos")
    .where("veterinario_id", "==", veterinario_id)
    .where("data", "==", dataObjeto)
    .where("hora", "==", hora)
    .get();

  if (!conflito.empty) {
    return res.status(400).json({ erro: "Horário ocupado" });
  }

  // Verificar se o pet pertence ao tutor logado
  // Agora apenas verificamos se o pet existe e pegamos o tutor_id dele
  const petDoc = await db.collection("pets").doc(pet_id).get();
  if (!petDoc.exists) {
    return res.status(404).json({ erro: "Pet não encontrado." });
  }

  const tutor_id = petDoc.data().tutor_id;

  // Verificar se o veterinário existe
  const vetDoc = await db.collection("veterinarios").doc(veterinario_id).get();
  if (!vetDoc.exists) {
    return res.status(404).json({ erro: "Perfil de veterinário não encontrado." });
  }

  const novo = {
    pet_id,
    veterinario_id,
    tutor_id,
    data: dataObjeto,
    hora,
    status: "pendente"
  };

  const ref = await db.collection("agendamentos").add(novo);

  // buscar dados do tutor para enviar a mensagem
  const tutorDoc = await db.collection("tutores").doc(tutor_id).get();
  const tutor = tutorDoc.data();

  // Formata a data para DD/MM/AAAA para a mensagem de WhatsApp
  const dataFormatada = data.split('-').reverse().join('/');

  enviarMensagem(
    tutor.telefone,
    `Olá ${tutor.nome}! O Dr(a). ${vetDoc.data().nome} agendou uma consulta para ${petDoc.data().nome} no dia ${dataFormatada} às ${hora}. 
    Por favor, confirme ou desmarque a consulta acessando seu painel.`
  );

  res.json({ id: ref.id, msg: "Agendamento criado com sucesso!" });
});

// Rota para confirmar ou cancelar agendamento
router.patch("/:id/status", auth, async (req, res) => {
  const { status } = req.body; // esperado: 'confirmado' ou 'cancelado'
  const { id } = req.params;

  if (!['confirmado', 'cancelado'].includes(status)) {
    return res.status(400).json({ erro: "Status inválido. Use 'confirmado' ou 'cancelado'." });
  }

  try {
    const agendamentoRef = db.collection("agendamentos").doc(id);
    const doc = await agendamentoRef.get();

    if (!doc.exists) return res.status(404).json({ erro: "Agendamento não encontrado." });

    await agendamentoRef.update({ status });
    res.json({ msg: `Agendamento ${status} com sucesso!` });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// READ - Filtered by user role
router.get("/", auth, async (req, res) => {
  let query = db.collection("agendamentos");
  let dados = [];

  if (req.user.role === 'tutor') {
    query = query.where("tutor_id", "==", req.user.uid);
    const snapshot = await query.get();
    dados = snapshot.docs.map(doc => {
      const agendamento = { id: doc.id, ...doc.data() };
      
      // Se for um Timestamp do Firebase, converte para string formatada
      if (agendamento.data && typeof agendamento.data.toDate === 'function') {
        agendamento.data = agendamento.data.toDate().toLocaleDateString('pt-BR');
      }
      return agendamento;
    });
  } else if (req.user.role === 'veterinario') {
    query = query.where("veterinario_id", "==", req.user.uid);
    const snapshot = await query.get();

    // Processar agendamentos para veterinários, incluindo nome do tutor e detalhes do pet
    const agendamentosPromises = snapshot.docs.map(async doc => {
      const agendamento = { id: doc.id, ...doc.data() };

      // Se for um Timestamp do Firebase, converte para string formatada
      if (agendamento.data && typeof agendamento.data.toDate === 'function') {
        agendamento.data = agendamento.data.toDate().toLocaleDateString('pt-BR');
      }

      // Buscar detalhes do Tutor
      const tutorDoc = await db.collection("tutores").doc(agendamento.tutor_id).get();
      if (tutorDoc.exists) {
        agendamento.tutor_nome = tutorDoc.data().nome;
      } else {
        agendamento.tutor_nome = "Tutor Desconhecido";
      }

      // Buscar detalhes do Pet
      const petDoc = await db.collection("pets").doc(agendamento.pet_id).get();
      if (petDoc.exists) {
        agendamento.pet_nome = petDoc.data().nome;
        agendamento.pet_tipo = petDoc.data().tipo;
      } else {
        agendamento.pet_nome = "Pet Desconhecido";
        agendamento.pet_tipo = "Tipo Desconhecido";
      }

      return agendamento;
    });

    dados = await Promise.all(agendamentosPromises);
  } else {
    return res.status(403).json({ erro: "Acesso negado. Função de usuário desconhecida." });
  }

  res.json(dados.length > 0 ? dados : { msg: "Nenhum agendamento encontrado para este usuário." });
});

module.exports = router;