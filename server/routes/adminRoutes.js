import { Router } from "express";
import {
  deleteExperimentReview,
  deleteResearcher,
  getAllExperiments,
  getDashboard,
  getExperimentReview,
  getResearchers,
} from "../controllers/adminController.js";
import { allowRoles, authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate, allowRoles("admin"));
router.get("/researchers", getResearchers);
router.delete("/researchers/:id", deleteResearcher);
router.get("/experiments/:id", getExperimentReview);
router.delete("/experiments/:id", deleteExperimentReview);
router.get("/experiments", getAllExperiments);
router.get("/dashboard", getDashboard);
export default router;
