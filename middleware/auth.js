const admin = require('firebase-admin');

const verificarToken = async (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ erro: "Token não fornecido" });

  const token = header.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = { uid: decodedToken.uid, email: decodedToken.email };

    // Determinar o papel (role) do usuário consultando o Firestore
    const db = admin.firestore();
    const tutorDoc = await db.collection("tutores").doc(decodedToken.uid).get();
    const veterinarioDoc = await db.collection("veterinarios").doc(decodedToken.uid).get();

    if (tutorDoc.exists) {
      req.user.role = 'tutor';
    } else if (veterinarioDoc.exists) {
      req.user.role = 'veterinario';
    } else {
      return res.status(403).json({ erro: "Perfil de usuário não encontrado no sistema." });
    }

    next();
  } catch (error) {
    res.status(401).json({ erro: "Token inválido ou expirado" });
  }
};

module.exports = verificarToken;