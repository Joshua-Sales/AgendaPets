const admin = require("firebase-admin");

const auth = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
      return res.status(401).json({ erro: "Nenhum token de autenticação fornecido." });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = { uid: decodedToken.uid, email: decodedToken.email };

    // Determine user role from Firestore
    const db = admin.firestore();
    const tutorDoc = await db.collection("tutores").doc(decodedToken.uid).get();
    const veterinarioDoc = await db.collection("veterinarios").doc(decodedToken.uid).get();

    if (tutorDoc.exists) {
      req.user.role = 'tutor';
    } else if (veterinarioDoc.exists) {
      req.user.role = 'veterinario';
    } else {
      // User exists in Firebase Auth but not in our Firestore collections
      return res.status(403).json({ erro: "Perfil de usuário não encontrado no Firestore." });
    }

    next();
  } catch (error) {
    console.error("Erro na autenticação:", error.message);
    res.status(401).json({ erro: "Não autorizado ou token inválido/expirado." });
  }
};

module.exports = auth;