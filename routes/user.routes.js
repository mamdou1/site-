const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const uploadPhoto = require("../middlewares/uploadPhoto.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");

console.log("verifyToken:", verifyToken);

router.post("/", verifyToken, userController.createUser);
router.get("/", verifyToken, userController.getAllUsers);
router.get("/:id", verifyToken, userController.getUserById);
router.put("/:id", verifyToken, userController.updateUser);
router.delete("/:id", verifyToken, userController.deleteUser);

// upload photo
router.post("/upload/:id", verifyToken, uploadPhoto.single("photo"), userController.uploadPhoto);

module.exports = router;