const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createPlan = async (req, res) => {
  try {
    const plan = await prisma.alimentacionPlan.create({
      data: req.body,
    });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllPlanes = async (req, res) => {
  const planes = await prisma.alimentacionPlan.findMany({
    include: { comidas: true }
  });
  res.json(planes);
};

const getPlanById = async (req, res) => {
  const { id } = req.params;
  const plan = await prisma.alimentacionPlan.findUnique({
    where: { id: parseInt(id) },
    include: { comidas: true }
  });
  res.json(plan);
};

const updatePlan = async (req, res) => {
  const { id } = req.params;
  const plan = await prisma.alimentacionPlan.update({
    where: { id: parseInt(id) },
    data: req.body,
  });
  res.json(plan);
};

const deletePlan = async (req, res) => {
  const { id } = req.params;
  await prisma.alimentacionPlan.delete({ where: { id: parseInt(id) } });
  res.json({ message: "Plan eliminado" });
};

module.exports = {
  createPlan,
  getAllPlanes,
  getPlanById,
  updatePlan,
  deletePlan,
};
