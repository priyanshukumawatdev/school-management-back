const express = require("express");
const router = express.Router();
const {
  uploadExcel,
  viewStudent,
  downloadExcel,
  createStudent,
  updateStudent,
  deleteStudent,
  studentList,
} = require("../../controllers/student/studenController");
const { jwtVerify, roleCheck } = require("../../middlewares/auth");
const  fileExcelUpload  = require("../../middlewares/fileUpload");

router.post(
  "/uploadExcel",
  jwtVerify,
  roleCheck("Admin"),
  fileExcelUpload({
    folder: "main/student",
    fieldName: "file",
    maxSizeMB: 5,
  }),
  uploadExcel,
);
router.get("/downloadExcel", jwtVerify, roleCheck("Admin"), downloadExcel);
router.post("/create", jwtVerify, roleCheck("Admin"), createStudent);
router.get("/list", jwtVerify, roleCheck("Admin"), studentList);
router.get("/:studenId", jwtVerify, roleCheck("Admin"), viewStudent);
router.patch("/:studenId", jwtVerify, roleCheck("Admin"), updateStudent);
router.delete("/:studenId", jwtVerify, roleCheck("Admin"), deleteStudent);

module.exports = router;
