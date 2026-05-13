const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const auth = require("../middleware/auth");

router.get('/', auth, async (req, res) => {
  const db = admin.firestore();
  let tutor_id = req.user.uid;

  // Se for veterinário e houver um tutor_id na query, filtramos por ele
  if (req.user.role === 'veterinario' && req.query.tutor_id) {
    tutor_id = req.query.tutor_id;
  }

  try {
    const snapshot = await db.collection('pets').where('tutor_id', '==', tutor_id).get();
    const pets = [];
    snapshot.forEach(doc => pets.push({ id: doc.id, ...doc.data() }));
    res.json(pets);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  const db = admin.firestore();
  const { nome, tipo, raca } = req.body;
  try {
    const newPet = await db.collection('pets').add({
      nome, tipo, raca,
      tutor_id: req.user.uid,
      criadoEm: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ id: newPet.id, msg: "Pet cadastrado!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;