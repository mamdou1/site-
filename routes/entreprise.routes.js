// routes/entreprise.routes.js
const express = require("express");
const router = express.Router();
const enterpriseController = require("../controllers/entreprise.controller");
const uploadVideo = require("../middlewares/uploadVideo.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post("/", enterpriseController.create);
router.get("/", enterpriseController.findAll);
router.get("/:id", enterpriseController.findById);
router.get("/:id/videos", enterpriseController.getVideos);
router.put("/:id", verifyToken, enterpriseController.update);
router.delete("/:id", verifyToken, enterpriseController.delete);

// Ajouter une vidéo à une entreprise avec upload (protégé)
router.post(
  "/:id/videos",
  verifyToken,
  uploadVideo.single("video"),
  enterpriseController.addVideo,
);

module.exports = router;
