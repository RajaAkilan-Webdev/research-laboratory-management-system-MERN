import { Op } from "sequelize";
import Experiment from "../models/Experiment.js";
import asyncHandler from "../utils/asyncHandler.js";
import recordHistory from "../utils/recordHistory.js";

export function relatedController(Model, fields, addedAction) {
  return {
    list: asyncHandler(async (req, res) => {
      const experiment = await Experiment.findByPk(req.params.experimentId);
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
      const where = { experimentId: experiment.id };
      if (Model.name === "Protocol" && req.query.search) {
        where[Op.or] = [
          { steps: { [Op.like]: `%${req.query.search}%` } },
          { materials: { [Op.like]: `%${req.query.search}%` } },
        ];
      }
      res.json(await Model.findAll({ where, order: [["createdAt", "ASC"]] }));
    }),
    create: asyncHandler(async (req, res) => {
      const { experimentId, ...values } = req.body;
      if (
        !experimentId ||
        fields.some((field) => !String(values[field] || "").trim())
      ) {
        return res
          .status(400)
          .json({ message: "All required fields must be completed." });
      }
      const experiment = await Experiment.findByPk(experimentId);
      if (!experiment)
        return res.status(404).json({ message: "Experiment not found." });
      if (String(experiment.researcherId) !== String(req.user.id)) {
        return res
          .status(403)
          .json({ message: "You do not have access to this experiment." });
      }
      const item = await Model.create({ experimentId, ...values });
      await recordHistory(experimentId, addedAction);
      res.status(201).json(item);
    }),
    update: asyncHandler(async (req, res) => {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: "Record not found." });
      const experiment = await Experiment.findByPk(item.experimentId);
      if (
        !experiment ||
        String(experiment.researcherId) !== String(req.user.id)
      ) {
        return res
          .status(403)
          .json({ message: "You do not have access to this record." });
      }
      fields.forEach((field) => {
        if (req.body[field] !== undefined) item[field] = req.body[field];
      });
      await item.save();
      res.json(item);
    }),
    remove: asyncHandler(async (req, res) => {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: "Record not found." });
      const experiment = await Experiment.findByPk(item.experimentId);
      if (
        !experiment ||
        String(experiment.researcherId) !== String(req.user.id)
      ) {
        return res
          .status(403)
          .json({ message: "You do not have access to this record." });
      }
      await item.destroy();
      res.json({ message: "Record deleted." });
    }),
  };
}
