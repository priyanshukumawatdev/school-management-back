const XLSX = require("xlsx");
const mongoose = require("mongoose");
const Student = require("../../models/student/Student");
const Subject = require("../../models/student/Subject");
const { calculateResult } = require("../../utils/helpers");
const puppeteer = require("puppeteer");
const generateHTML = require("../../utils/marksheetTemplate");


const prepareSubjects = (subjects, studentId) => {
  const subjectDataForResult = [];
  const subjectDocs = subjects.map((sub) => {
    const quarterly = Number(sub.quarterly || 0);
    const halfYearly = Number(sub.halfYearly || 0);
    const annually = Number(sub.annually || 0);
    const total = quarterly + halfYearly + annually;

    subjectDataForResult.push({
      ...sub,
      quarterly,
      halfYearly,
      annually,
      total,
    });

    return {
      student: studentId,
      subjectName: sub.subjectName,
      maxMarks: sub.maxMarks,
      minMarks: sub.minMarks,
      quarterly,
      halfYearly,
      annually,
      total,
    };
  });

  return { subjectDocs, subjectDataForResult };
};

exports.createStudent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { scholarNo, name, fatherName, motherName, dob, className, sessionStart,sessionEnd, subjects = [] } = req.body;

    if (await Student.findOne({ scholarNo })) {
      return res.status(400).json({ success: false, message: "Scholar number already exists" });
    }

    const [student] = await Student.create([{ scholarNo, name, fatherName, motherName, dob, className, sessionStart,sessionEnd}], { session });

    let subjectIds = [];
    if (subjects.length) {
      const { subjectDocs, subjectDataForResult } = prepareSubjects(subjects, student._id);
      const createdSubjects = await Subject.insertMany(subjectDocs, { session });
      subjectIds = createdSubjects.map((s) => s._id);
      Object.assign(student, calculateResult(subjectDataForResult));
    }

    student.subjects = subjectIds;
    await student.save({ session });
    await session.commitTransaction();
    session.endSession();

    const populatedStudent = await Student.findById(student._id).populate("subjects");
    res.status(201).json({ success: true, data: populatedStudent });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create student" });
  }
};

exports.updateStudent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { studentId } = req.params;
    const { subjects = [], ...studentData } = req.body;

    const student = await Student.findById(studentId).session(session);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    Object.assign(student, studentData);
    await Subject.deleteMany({ student: student._id }, { session });

    let subjectIds = [];
    if (subjects.length) {
      const { subjectDocs, subjectDataForResult } = prepareSubjects(subjects, student._id);
      const createdSubjects = await Subject.insertMany(subjectDocs, { session });
      subjectIds = createdSubjects.map((s) => s._id);
      Object.assign(student, calculateResult(subjectDataForResult));
    }

    student.subjects = subjectIds;
    await student.save({ session });
    await session.commitTransaction();
    session.endSession();

    const populatedStudent = await Student.findById(student._id).populate("subjects");
    res.json({ success: true, data: populatedStudent });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update student" });
  }
};

exports.viewStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const result = await Student.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(studentId) } },
      {
        $lookup: {
          from: "subjects",
          localField: "_id",
          foreignField: "student",
          as: "subjects",
        },
      },
    ]);

    if (!result.length) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const student = result[0];
    res.json({ success: true, data: student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch student" });
  }
};

exports.studentList = async (req, res) => {
  try {
    let { page = 1, limit = 10, search, className, result, sortBy = "createdAt", order = "desc" } = req.query;
    page = Number(page);
    limit = Number(limit);

    const matchStage = {};
    if (search) matchStage.$or = [{ name: { $regex: search, $options: "i" } }, { scholarNo: { $regex: search, $options: "i" } }];
    if (className) matchStage.className = className;
    if (result) matchStage.result = result;

    const pipeline = [
      { $match: matchStage },
      { $lookup: { from: "subjects", localField: "_id", foreignField: "student", as: "subjects" } },
      { $addFields: { subjectCount: { $size: "$subjects" } } },
      { $sort: { [sortBy]: order === "desc" ? -1 : 1 } },
      { $facet: { data: [{ $skip: (page - 1) * limit }, { $limit: limit }], totalCount: [{ $count: "count" }] } },
    ];

    const resultData = await Student.aggregate(pipeline);
    const students = resultData[0].data;
    const total = resultData[0].totalCount[0]?.count || 0;

    res.json({ success: true, data: students, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch students" });
  }
};

exports.deleteStudent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { studentId } = req.params;
    await Subject.deleteMany({ student: studentId }, { session });
    await Student.findByIdAndDelete(studentId).session(session);
    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete student" });
  }
};

exports.uploadExcel = async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const rows = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]]
    );

    if (!rows.length) throw new Error("Excel file is empty");

    const groupedStudents = {};

    rows.forEach((row) => {
      const scholarNo = row.scholarNo;

      if (!groupedStudents[scholarNo])
        groupedStudents[scholarNo] = {
          ...row,
          dob: new Date(row.dob),
          subjects: [],
        };

      const quarterly = Number(row.quarterly || 0);
      const halfYearly = Number(row.halfYearly || 0);
      const annually = Number(row.annually || 0);

      groupedStudents[scholarNo].subjects.push({
        subjectName: row.subject,
        maxMarks: Number(row.maxMarks),
        minMarks: Number(row.minMarks),
        quarterly,
        halfYearly,
        annually,
        total: quarterly + halfYearly + annually,
      });
    });

    for (const key in groupedStudents) {
      const data = groupedStudents[key];

      const { subjects, ...studentData } = data;

      let student = await Student.findOneAndUpdate(
        { scholarNo: data.scholarNo },
        studentData,
        { upsert: true, new: true }
      );

      await Subject.deleteMany({ student: student._id });

      const { subjectDocs, subjectDataForResult } = prepareSubjects(
        subjects,
        student._id
      );

      const createdSubjects = await Subject.insertMany(subjectDocs);

      student.subjects = createdSubjects.map((s) => s._id);

      Object.assign(student, calculateResult(subjectDataForResult));

      await student.save();
    }

    res.json({
      success: true,
      message: "Excel uploaded successfully",
      totalStudents: Object.keys(groupedStudents).length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadExcel = async (req, res) => {
  try {
    const students = await Student.find().populate("subjects");
    const formattedData = students.flatMap((s) =>
      s.subjects.map((sub) => ({
        "Scholar No": s.scholarNo,
        "Student Name": s.name,
        "Father Name": s.fatherName,
        "Mother Name": s.motherName,
        "DOB": s.dob ? new Date(s.dob).toLocaleDateString("en-GB") : "",
        "Class": s.className,
        "Session Start": s.sessionStart,
        "Session End": s.sessionEnd,
        "Subject": sub.subjectName,
        "Max Marks": sub.maxMarks,
        "Min Marks": sub.minMarks,
        "Quarterly": sub.quarterly,
        "Half Yearly": sub.halfYearly,
        "Annually": sub.annually,
        "Subject Total": sub.total,
        "Grand Total": s.grandTotal,
        "Overall %": s.overallPercentage,
        "Division": s.division,
        "Grade": s.grade,
        "Result": s.result,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(formattedData), "Students");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to download Excel" });
  }
};


let browser;
exports.downloadStudentPDF = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId)
      .populate("subjects")
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // ✅ Launch browser only once
    if (!browser) {
      browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    const page = await browser.newPage();

    const html = generateHTML(student);

    await page.setContent(html, {
      waitUntil: ["load", "networkidle0"],
    });


    const pdfBuffer = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true
    });
    await page.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${student.name}_result.pdf`,
    });

    return res.send(pdfBuffer);

  } catch (error) {
    console.error("PDF Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate PDF",
    });
  }
};