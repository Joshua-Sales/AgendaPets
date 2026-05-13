const express = require("express");
const router = express.Router();
const admin = require("firebase-admin"); // Import admin
const auth = require("../middleware/auth");

const db = admin.firestore(); // Initialize Firestore here

// GET PROFILE OF LOGGED-IN VETERINARIAN
router.get("/me", auth, async (req, res) => {
  if (req.user.role !== 'veterinario') {
    return res.status(403).json({ erro: "Acesso negado. Apenas veterinários podem ver este perfil." });
  }
  try {
    const doc = await db.collection("veterinarios").doc(req.user.uid).get();
    if (!doc.exists) {
      return res.status(404).json({ erro: "Veterinário não encontrado" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// CREATE
router.post("/", auth, async (req, res) => {
  const ref = await db.collection("veterinarios").add(req.body);
  res.json({ id: ref.id });
});


// READ
router.get("/", async (req, res) => {
  const snapshot = await db.collection("veterinarios").get();

  const dados = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  res.json(dados);
});

module.exports = router;