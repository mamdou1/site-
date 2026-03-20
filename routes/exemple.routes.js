const router = require("express").Router();
const ctrl = require("../controller/exemple.controller");

router.post("/", ctrl.create);
router.get("/", ctrl.findAll);
router.get("/:id", ctrl.findById);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.delete);
router.get("/:id/salle", ctrl.getAllSalleBySite);

module.exports = router;