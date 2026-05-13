require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// 1. Inicialização do Firebase Admin
try {
  const serviceAccount = require("./agendapet-dbbcc-firebase-adminsdk-fbsvc-67184b3312.json");
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log(" Firebase Admin inicializado com sucesso usando o arquivo JSON.");
  }
} catch (error) {
  console.error(" ERRO ao carregar o arquivo JSON do Firebase:", error.message);
  process.exit(1); // Para o servidor se o JSON estiver errado
}

const db = admin.firestore();

// A chave agora é lida do arquivo .env com segurança
const FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY ? process.env.FIREBASE_WEB_API_KEY.trim() : null;

// Verificação de inicialização
if (!FIREBASE_WEB_API_KEY || FIREBASE_WEB_API_KEY.includes("Cole_Aqui")) {
  console.warn(" AVISO: FIREBASE_WEB_API_KEY não detectada. O login não funcionará até que você a adicione ao .env");
}

// Importação das Rotas
const authRoutes = require('./routes/auth');
const tutorRoutes = require('./routes/tutores');
const veterinarioRoutes = require('./routes/veterinarios'); // New route
const petRoutes = require('./routes/pets');
const agendamentoRoutes = require('./routes/agendamentos'); // New route

// 2. Rota Raiz (Resolve o erro "Cannot GET /")
// Serve o arquivo index.html quando você acessa http://localhost:3000/
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 3. Rota de teste solicitada pelo frontend (Testar Conexão)
app.get('/servicos', async (req, res) => {
  try {
    // Exemplo: busca uma coleção chamada 'servicos' no Firestore
    const snapshot = await db.collection('servicos').get();
    const servicos = [];
    snapshot.forEach(doc => servicos.push({ id: doc.id, ...doc.data() }));
    
    res.json(servicos.length > 0 ? servicos : { msg: "Conectado ao Firebase, mas a coleção 'servicos' está vazia." });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// Montagem das Rotas
app.use('/auth', authRoutes);
app.use('/tutores', tutorRoutes);
app.use('/veterinarios', veterinarioRoutes); // New route
app.use('/pets', petRoutes);
app.use('/agendamentos', agendamentoRoutes); // New route

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
   Servidor rodando em http://localhost:${PORT}
   Rota / configurada.
  `);
});