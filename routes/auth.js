const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

const FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY;

// REGISTER
router.post("/register", async (req, res) => {
  const { nome, email, telefone, senha, role } = req.body;
  const db = admin.firestore();

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password: senha,
      displayName: nome,
    });

    // Define a coleção correta com base no papel selecionado
    const colecao = role === 'veterinario' ? 'veterinarios' : 'tutores';

    await db.collection(colecao).doc(userRecord.uid).set({
      nome,
      email,
      telefone,
      criadoEm: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ id: userRecord.uid, msg: "Usuário criado com sucesso!" });
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ erro: "Este e-mail já está sendo usado por outra conta." });
    }
    res.status(400).json({ erro: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!FIREBASE_WEB_API_KEY) {
    return res.status(500).json({ erro: "Configuração do servidor incompleta (API KEY)." });
  }

  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`, {
      method: 'POST',
      body: JSON.stringify({ email, password: senha, returnSecureToken: true }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();

    if (data.error) {
      return res.status(401).json({ erro: data.error.message });
    }

    // After successful Firebase Auth login, determine user role
    const decodedToken = await admin.auth().verifyIdToken(data.idToken);
    const uid = decodedToken.uid;
    const db = admin.firestore();

    let role = null;
    const tutorDoc = await db.collection("tutores").doc(uid).get();
    const veterinarioDoc = await db.collection("veterinarios").doc(uid).get();

    if (tutorDoc.exists) {
      role = 'tutor';
    } else if (veterinarioDoc.exists) {
      role = 'veterinario';
    }
    res.json({ token: data.idToken, email: data.email, role: role });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao conectar com o serviço de autenticação." });
  }
});

module.exports = router;