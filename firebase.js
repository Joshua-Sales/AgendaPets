const admin = require("firebase-admin");

const serviceAccount = require("./agendapet-dbbcc-firebase-adminsdk-fbsvc-67184b3312.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

module.exports = db;