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
  downloadStudentPDF
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
router.get("/:studentId", jwtVerify, roleCheck("Admin"), viewStudent);
router.patch("/:studentId", jwtVerify, roleCheck("Admin"), updateStudent);
router.delete("/:studentId", jwtVerify, roleCheck("Admin"), deleteStudent);
router.get("/pdf/:studentId", jwtVerify, roleCheck("Admin"), downloadStudentPDF);

module.exports = router;
