import { Router } from "express";
import {
  createExperiment,
  deleteExperiment,
  getExperiment,
  getHistory,
  listExperiments,
  updateExperiment,
} from "../controllers/experimentController.js";
import { allowRoles, authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);
router.get("/", listExperiments);
router.get("/:id/history", getHistory);
router.get("/:id", getExperiment);
router.post("/", allowRoles("researcher"), createExperiment);
router.put("/:id", allowRoles("researcher"), updateExperiment);
router.delete("/:id", allowRoles("researcher"), deleteExperiment);
export default router;
