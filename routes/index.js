const studenRoutes = require("./student/studentRoutes");
const userRoutes = require("./user/userRoutes");
const express = require("express");
const router = express.Router();

router.use("/student", studenRoutes);
router.use("/admin", userRoutes);

module.exports = router;