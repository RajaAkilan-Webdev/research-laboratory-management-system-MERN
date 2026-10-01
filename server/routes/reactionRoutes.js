import { Router } from "express";
import Reaction from "../models/Reaction.js";
import { relatedController } from "../controllers/relatedController.js";
import { allowRoles, authenticate } from "../middleware/auth.js";

const router = Router();
const controller = relatedController(
  Reaction,
  ["reactants", "products"],
  "Reaction Added",
);
router.use(authenticate, allowRoles("researcher"));
router.post("/", controller.create);
router.get("/experiment/:experimentId", controller.list);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);
export default router;
