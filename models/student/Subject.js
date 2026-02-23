const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    subjectName: { type: String, required: true },

    maxMarks: { type: Number, required: true },
    minMarks: { type: Number, required: true },

    quarterly: { type: Number, default: 0 },
    halfYearly: { type: Number, default: 0 },
    annually: { type: Number, default: 0 },

    total: { type: Number },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Subject", subjectSchema);
