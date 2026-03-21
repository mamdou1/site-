// routes/service.routes.js
const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/service.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// Routes publiques
router.get("/", serviceController.findAll);
router.get("/:id", serviceController.findById);
router.get("/:id/videos", serviceController.getVideos);

// Routes protégées
router.post("/", verifyToken, serviceController.create);
router.put("/:id", verifyToken, serviceController.update);
router.delete("/:id", verifyToken, serviceController.delete);

module.exports = router;
