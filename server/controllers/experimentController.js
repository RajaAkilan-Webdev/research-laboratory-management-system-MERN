import { Op } from "sequelize";
import Experiment from "../models/Experiment.js";
import ExperimentHistory from "../models/ExperimentHistory.js";
import Protocol from "../models/Protocol.js";
import Reaction from "../models/Reaction.js";
import Observation from "../models/Observation.js";
import asyncHandler from "../utils/asyncHandler.js";
import recordHistory from "../utils/recordHistory.js";
import { serializeExperiment } from "../utils/serialize.js";

export const listExperiments = asyncHandler(async (req, res) => {
  const where = {};
  if (req.user.role !== "admin") where.researcherId = req.user.id;
  if (req.query.status) where.status = req.query.status;
  if (req.query.search) where.title = { [Op.like]: `%${req.query.search}%` };
  const experiments = await Experiment.findAll({
    where,
    include: [
      { association: "researcher", attributes: ["id", "name", "email"] },
    ],
    order: [["date", req.query.sort === "oldest" ? "ASC" : "DESC"]],
  });
  res.json(experiments.map(serializeExperiment));
});

export const getExperiment = asyncHandler(async (req, res) => {
  const experiment = await Experiment.findByPk(req.params.id, {
    include: [
      { association: "researcher", attributes: ["id", "name", "email"] },
    ],
  });
  if (!experiment)
    return res.status(404).json({ message: "Experiment not found." });
  if (
    req.user.role !== "admin" &&
    String(experiment.researcherId) !== String(req.user.id)
  ) {
    return res
      .status(403)
      .json({ message: "You do not have access to this experiment." });
  }
  res.json(serializeExperiment(experiment));
});

export const createExperiment = asyncHandler(async (req, res) => {
  const { title, description = "", date, status = "Planned" } = req.body;
  const normalizedTitle = typeof title === "string" ? title.trim() : "";
  if (!normalizedTitle || !date)
    return res.status(400).json({ message: "Title and date are required." });
  const existing = await Experiment.findOne({
    where: { researcherId: req.user.id, title: normalizedTitle },
  });
  if (existing)
    return res
      .status(409)
      .json({ message: "You already have an experiment with this title." });
  const experiment = await Experiment.create({
    title: normalizedTitle,
    description,
    date,
    status,
    researcherId: req.user.id,
  });
  await recordHistory(experiment._id, "Experiment Created");
  res.status(201).json(experiment);
});

export const updateExperiment = asyncHandler(async (req, res) => {
  const experiment = await Experiment.findOne({
    where: { id: req.params.id, researcherId: req.user.id },
  });
  if (!experiment)
    return res.status(404).json({ message: "Experiment not found." });
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
  if (req.body.title !== undefined && !title)
    return res.status(400).json({ message: "A title is required." });
  if (req.body.title !== undefined) {
    const duplicate = await Experiment.findOne({
      where: {
        researcherId: req.user.id,
        title,
        id: { [Op.ne]: experiment.id },
      },
    });
    if (duplicate)
      return res
        .status(409)
        .json({ message: "You already have an experiment with this title." });
  }
  const fields = ["title", "description", "date", "status", "result"];
  fields.forEach((field) => {
    if (field === "title" && req.body.title !== undefined)
      experiment.title = title;
    else if (req.body[field] !== undefined) experiment[field] = req.body[field];
  });
  await experiment.save();
  await recordHistory(
    experiment._id,
    req.body.result !== undefined ? "Result Updated" : "Experiment Updated",
  );
  res.json(experiment);
});

export const deleteExperiment = asyncHandler(async (req, res) => {
  const experiment = await Experiment.findOne({
    where: { id: req.params.id, researcherId: req.user.id },
  });
  if (!experiment)
    return res.status(404).json({ message: "Experiment not found." });
  await recordHistory(experiment._id, "Experiment Deleted");
  await Promise.all([
    Protocol.destroy({ where: { experimentId: experiment.id } }),
    Reaction.destroy({ where: { experimentId: experiment.id } }),
    Observation.destroy({ where: { experimentId: experiment.id } }),
  ]);
  await experiment.destroy();
  res.json({ message: "Experiment deleted." });
});

export const getHistory = asyncHandler(async (req, res) => {
  const experiment = await Experiment.findByPk(req.params.id);
  if (!experiment)
    return res.status(404).json({ message: "Experiment not found." });
  if (
    req.user.role !== "admin" &&
    String(experiment.researcherId) !== String(req.user.id)
  ) {
    return res
      .status(403)
      .json({ message: "You do not have access to this history." });
  }
  const history = await ExperimentHistory.findAll({
    where: { experimentId: experiment.id },
    order: [["timestamp", "ASC"]],
  });
  res.json(history);
});
