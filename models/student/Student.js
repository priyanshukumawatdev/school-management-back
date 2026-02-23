const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    scholarNo: { type: String, required: true, unique: true },
    schoolCode: { type: String, required: true },

    name: { type: String, required: true },
    dob: { type: Date },

    className: String,
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],

    session: String,

    fatherName: String,
    motherName: String,

    grandTotal: Number,
    overallPercentage: Number,
    division: String,
    grade: String,
    result: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Student", studentSchema);
