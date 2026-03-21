// routes/solution.routes.js
const express = require("express");
const router = express.Router();
const solutionController = require("../controllers/solution.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// Routes publiques
router.get("/", solutionController.findAll);
router.get("/:id", solutionController.findById);

// Routes protégées
router.post("/", verifyToken, solutionController.create);
router.put("/:id", verifyToken, solutionController.update);
router.delete("/:id", verifyToken, solutionController.delete);

module.exports = router;
