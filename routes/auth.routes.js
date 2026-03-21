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

router.post("/inscription", inscription);
router.post("/connexion", connexion);
router.post("/deconnexion", verifyToken, deconnexion);
router.post("/refresh", refresh);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-password", verifyToken, verifyAndReset);
router.post("/change-forgot-password", verifyToken, updatePassword);
router.post("/change-password", verifyToken, changerPassword);
router.get("/me", verifyToken);
module.exports = router;
