const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");

const contactController = require("../controllers/contact.controller");

router.post("/", contactController.createContact);
router.get("/", verifyToken, contactController.getContacts);
router.delete("/", verifyToken, contactController.deleteContact);

module.exports = router;