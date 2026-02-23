import jwt from "jsonwebtoken";
export const generateToken = (user) => {
  return jwt.sign(
    { userid: user._id},
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

export const expireToken = () => {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0); 
  return midnight.getTime() - now.getTime();
}


export const calculateResult = (subjects) => {
  let grandTotal = 0;
  let totalMaxMarks = 0;
  let hasFailedSubject = false;

  subjects.forEach((sub) => {
    grandTotal += sub.total;
    totalMaxMarks += sub.maxMarks;
    if (sub.total < sub.minMarks) hasFailedSubject = true;
  });

  const percentage =
    totalMaxMarks > 0 ? (grandTotal / totalMaxMarks) * 100 : 0;

  let division = "Fail";
  let grade = "D";
  let result = "Fail";

  if (!hasFailedSubject && percentage >= 33) {
    result = "Pass";

    if (percentage >= 60) division = "First";
    else if (percentage >= 45) division = "Second";
    else division = "Third";

    if (percentage >= 90) grade = "A+";
    else if (percentage >= 75) grade = "A";
    else if (percentage >= 60) grade = "B";
    else if (percentage >= 45) grade = "C";
  }

  return {
    grandTotal,
    overallPercentage: Number(percentage.toFixed(2)),
    division,
    grade,
    result,
  };
};

