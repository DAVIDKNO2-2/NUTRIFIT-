const express = require("express");
const router = express.Router();
const alimentacionController = require("../controllers/alimentacionController");

// Crear plan
router.post("/", alimentacionController.createPlan);

// Listar todos los planes
router.get("/", alimentacionController.getAllPlanes);

// Obtener un plan por ID
router.get("/:id", alimentacionController.getPlanById);

// Actualizar un plan
router.put("/:id", alimentacionController.updatePlan);

// Eliminar un plan
router.delete("/:id", alimentacionController.deletePlan);

module.exports = router;
