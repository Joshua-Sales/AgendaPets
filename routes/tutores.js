const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const auth = require("../middleware/auth"); // Nosso novo middleware Firebase

// LISTAR TODOS OS TUTORES (Apenas para Veterinários)
router.get("/", auth, async (req, res) => {
  if (req.user.role !== 'veterinario') {
    return res.status(403).json({ erro: "Acesso negado. Apenas veterinários podem listar tutores." });
  }
  const db = admin.firestore();
  try {
    const snapshot = await db.collection("tutores").get();
    const tutores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(tutores);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

//  PERFIL DO USUÁRIO LOGADO
router.get("/me", auth, async (req, res) => {
  const db = admin.firestore();
  try {
    const doc = await db.collection("tutores").doc(req.user.uid).get();

    if (!doc.exists) {
      return res.status(404).json({ erro: "Tutor não encontrado" });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

//  UPDATE
router.put("/:id", auth, async (req, res) => {
  const db = admin.firestore();
  await db.collection("tutores").doc(req.params.id).update(req.body);
  res.json({ msg: "Atualizado" });
});

//  DELETE
router.delete("/:id", auth, async (req, res) => {
  const db = admin.firestore();
  await db.collection("tutores").doc(req.params.id).delete();
  res.json({ msg: "Removido" });
});

module.exports = router;