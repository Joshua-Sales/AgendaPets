const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

const db = admin.firestore();

// CREATE
router.post("/", async (req, res) => {
  const ref = await db.collection("servicos").add(req.body);
  res.json({ id: ref.id });
});


// READ
router.get("/", async (req, res) => {
  const snapshot = await db.collection("servicos").get();

  const dados = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  res.json(dados);
});

module.exports = router;