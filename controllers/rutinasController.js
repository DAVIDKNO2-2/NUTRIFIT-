const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllRoutines = async (req, res) => {
    const routines = await prisma.routine.findMany({
        include: { exercises: true },
    });
    res.json(routines);
};

const getRoutineById = async (req, res) => {
    const { id } = req.params;
    const routine = await prisma.routine.findUnique({
        where: { id: parseInt(id) },
        include: { exercises: true },
    });
    res.json(routine);
};

const createRoutine = async (req, res) => {
    try {
        const routine = await prisma.routine.create({
            data: req.body,
        });
        res.json(routine);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const addExerciseToRoutine = async (req, res) => {
    const { routineId } = req.params;
    const { name, repetitions, instructions } = req.body;
    try {
        const exercise = await prisma.exercise.create({
            data: {
                name,
                repetitions,
                instructions,
                routineId: parseInt(routineId),
            },
        });
        res.json(exercise);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateExercise = async (req, res) => {
    const { id } = req.params;
    const { name, repetitions, instructions } = req.body;
    try {
        const exercise = await prisma.exercise.update({
            where: { id: parseInt(id) },
            data: {
                name,
                repetitions,
                instructions,
            },
        });
        res.json(exercise);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteRoutine = async (req, res) => {
    const { id } = req.params;
    // First delete all exercises in the routine
    await prisma.exercise.deleteMany({
        where: { routineId: parseInt(id) },
    });
    // Then delete the routine itself
    await prisma.routine.delete({
        where: { id: parseInt(id) },
    });
    res.json({ message: "Routine and its exercises deleted successfully" });
};

module.exports = {
    getAllRoutines,
    getRoutineById,
    createRoutine,
    addExerciseToRoutine,
    updateExercise,
    deleteRoutine,
};
