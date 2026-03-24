const express  = require("express");
const router = express.Router();

const uploadPhoto = require("../middlewares/uploadPhoto.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");
const temoignageController = require("../controllers/temoignage.controller");

// PUBLIC (CLIENT)
// créer témoignage
router.post("/", temoignageController.createTemoignage);
// valider
router.put("/:id/valider", verifyToken, temoignageController.validateTemoignage);
// refuser
router.put("/:id/refuser", verifyToken, temoignageController.refuseTemoignage);
// voir témoignages validés (site web)
router.get("/public", temoignageController.getPublicTemoignages);
router.get("/", verifyToken, temoignageController.getAllTemoignages);
router.get("/:id", verifyToken, temoignageController.getTemoignageById);
router.put("/:id", verifyToken, temoignageController.updateTemoignage);
router.delete("/:id", verifyToken, temoignageController.deleteTemoignage);
router.post("/upload/:id", uploadPhoto.single("photo"), temoignageController.uploadPhotoTemoignage);

module.exports = router;