const express = require("express");
const router = express.Router();
const rutinasController = require("../controllers/rutinasController");

// Get all routines
router.get("/", rutinasController.getAllRoutines);

// Get a single routine by id
router.get("/:id", rutinasController.getRoutineById);

// Create a new routine
router.post("/", rutinasController.createRoutine);

// Add an exercise to a routine
router.post("/:routineId/exercises", rutinasController.addExerciseToRoutine);

// Update an exercise
router.put("/exercises/:id", rutinasController.updateExercise);

// Delete a routine
router.delete("/:id", rutinasController.deleteRoutine);

module.exports = router;
