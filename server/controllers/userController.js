import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    where: { role: "researcher" },
    attributes: { exclude: ["password"] },
    order: [["createdAt", "DESC"]],
  });
  res.json(users);
});

export const getUser = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && String(req.user.id) !== req.params.id) {
    return res
      .status(403)
      .json({ message: "You can only view your own profile." });
  }
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ["password"] },
  });
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json(user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  if (String(req.user.id) !== req.params.id)
    return res
      .status(403)
      .json({ message: "You can only update your own profile." });
  const { name, email } = req.body;
  if (!name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "")) {
    return res
      .status(400)
      .json({ message: "A name and valid email are required." });
  }
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ["password"] },
  });
  if (!user) return res.status(404).json({ message: "User not found." });
  await user.update({
    name: name.trim(),
    email: email.trim().toLowerCase(),
  });
  res.json(user);
});
