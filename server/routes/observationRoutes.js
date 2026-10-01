import { Router } from "express";
import Observation from "../models/Observation.js";
import { relatedController } from "../controllers/relatedController.js";
import { allowRoles, authenticate } from "../middleware/auth.js";

const router = Router();
const controller = relatedController(
  Observation,
  ["observation", "date"],
  "Observation Added",
);
router.use(authenticate, allowRoles("researcher"));
router.post("/", controller.create);
router.get("/experiment/:experimentId", controller.list);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);
export default router;
