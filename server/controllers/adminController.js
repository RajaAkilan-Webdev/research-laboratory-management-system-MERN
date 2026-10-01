import { Op } from "sequelize";
import sequelize from "../config/db.js";
import User from "../models/User.js";
import Experiment from "../models/Experiment.js";
import Protocol from "../models/Protocol.js";
import Reaction from "../models/Reaction.js";
import Observation from "../models/Observation.js";
import ExperimentHistory from "../models/ExperimentHistory.js";
import asyncHandler from "../utils/asyncHandler.js";
import { serializeExperiment } from "../utils/serialize.js";

async function deleteExperimentRecords(experimentIds, transaction) {
  if (!experimentIds.length) return;
  const where = { experimentId: { [Op.in]: experimentIds } };
  await Protocol.destroy({ where, transaction });
  await Reaction.destroy({ where, transaction });
  await Observation.destroy({ where, transaction });
  await ExperimentHistory.destroy({ where, transaction });
  await Experiment.destroy({
    where: { id: { [Op.in]: experimentIds } },
    transaction,
  });
}

export const getResearchers = asyncHandler(async (req, res) => {
  const researchers = await User.findAll({
    where: { role: "researcher" },
    attributes: { exclude: ["password"] },
    order: [["createdAt", "DESC"]],
  });
  res.json(researchers);
});

export const deleteResearcher = asyncHandler(async (req, res) => {
  const researcher = await User.findOne({
    where: { id: req.params.id, role: "researcher" },
  });
  if (!researcher)
    return res.status(404).json({ message: "Researcher not found." });

  await sequelize.transaction(async (transaction) => {
    const experiments = await Experiment.findAll({
      attributes: ["id"],
      where: { researcherId: researcher.id },
      transaction,
    });
    await deleteExperimentRecords(
      experiments.map((experiment) => experiment.id),
      transaction,
    );
    await researcher.destroy({ transaction });
  });
  res.json({ message: "Researcher and associated records deleted." });
});

export const getAllExperiments = asyncHandler(async (req, res) => {
  const experiments = await Experiment.findAll({
    include: [
      { association: "researcher", attributes: ["id", "name", "email"] },
    ],
    order: [["date", "DESC"]],
  });
  res.json(experiments.map(serializeExperiment));
});

export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalResearchers,
    totalExperiments,
    completedExperiments,
    activeExperiments,
    recentExperiments,
  ] = await Promise.all([
    User.count({ where: { role: "researcher" } }),
    Experiment.count(),
    Experiment.count({ where: { status: "Completed" } }),
    Experiment.count({ where: { status: "In Progress" } }),
    Experiment.findAll({
      include: [
        { association: "researcher", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    }),
  ]);
  res.json({
    totalResearchers,
    totalExperiments,
    completedExperiments,
    activeExperiments,
    recentExperiments: recentExperiments.map(serializeExperiment),
  });
});

export const getExperimentReview = asyncHandler(async (req, res) => {
  const experiment = await Experiment.findByPk(req.params.id, {
    include: [
      { association: "researcher", attributes: ["id", "name", "email"] },
    ],
  });
  if (!experiment)
    return res.status(404).json({ message: "Experiment not found." });
  const [protocols, reactions, observations, history] = await Promise.all([
    Protocol.findAll({
      where: { experimentId: experiment.id },
      order: [["createdAt", "ASC"]],
    }),
    Reaction.findAll({
      where: { experimentId: experiment.id },
      order: [["createdAt", "ASC"]],
    }),
    Observation.findAll({
      where: { experimentId: experiment.id },
      order: [["date", "ASC"]],
    }),
    ExperimentHistory.findAll({
      where: { experimentId: experiment.id },
      order: [["timestamp", "ASC"]],
    }),
  ]);
  res.json({
    experiment: serializeExperiment(experiment),
    protocols,
    reactions,
    observations,
    history,
  });
});

export const deleteExperimentReview = asyncHandler(async (req, res) => {
  const experiment = await Experiment.findByPk(req.params.id);
  if (!experiment)
    return res.status(404).json({ message: "Experiment not found." });
  await sequelize.transaction((transaction) =>
    deleteExperimentRecords([experiment.id], transaction),
  );
  res.json({ message: "Experiment and related records deleted." });
});
