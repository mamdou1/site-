// routes/auth.routes.js
const express = require("express");
const {
  connexion,
  deconnexion,
  refresh,
  forgotPassword,
  verifyAndReset,
  updatePassword,
  inscription,
  changerPassword,
} = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();

// AJOUTEZ CETTE LIGNE EN TOUT DÉBUT
console.log('🚨🚨🚨 FICHIER auth.routes.js CHARGÉ 🚨🚨🚨');

router.post("/inscription", inscription);
router.post("/connexion", connexion);
router.post("/deconnexion", verifyToken, deconnexion);
router.post("/refresh", refresh);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-password", verifyToken, verifyAndReset);
router.post("/change-forgot-password", verifyToken, updatePassword);
router.post("/change-password", verifyToken, changerPassword);

// routes/auth.routes.js
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await Users.findByPk(req.user.id, {
      attributes: { exclude: ["password"] }
    });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;