const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getUsers,
  getUser,
  deleteUser,
  deleteMultiple,
  updateUser,
  logout,
  getMe
} = require("../../controllers/user/authController");
const {jwtVerify,roleCheck} = require("../../middlewares/auth");


router.post("/register", register);
router.post("/login", login);
router.patch("/:id", jwtVerify,roleCheck("Admin"), updateUser);
router.get("/list", jwtVerify,roleCheck("Admin"), getUsers);
router.get("/:id", jwtVerify,roleCheck("Admin"), getUser);
router.delete("/:id", jwtVerify,roleCheck("Admin"), deleteUser);
router.delete("/delete", jwtVerify,roleCheck("Admin"), deleteMultiple);
router.post("/logout", jwtVerify, logout);
router.get("/me", jwtVerify, getMe);

module.exports = router;

