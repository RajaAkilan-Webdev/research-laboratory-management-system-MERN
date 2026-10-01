import { Router } from "express";
import {
  getUser,
  getUsers,
  updateProfile,
} from "../controllers/userController.js";
import { allowRoles, authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);
router.get("/", allowRoles("admin"), getUsers);
router.get("/:id", getUser);
router.put("/:id", updateProfile);
export default router;
