const generateHTML = (student) => {
  return `
<!DOCTYPE html>
<html>
<head>
<style>

@page {
  size: A4;
  margin: 0;
}

body {
  margin: 0;
  padding: 0;
  background: white;
}

.page {
  position: relative;
  width: 210mm;
  height: 297mm;
  font-family: Arial, sans-serif;
}

.overlay {
  position: relative;
  width: 100%;
  height: 100%;
  font-size: 14px;
}

/* ================= HEADER FIELDS ================= */

.scholarNo { position: absolute; top: 59mm; left: 38mm; font-weight: bold; }
.dob { position: absolute; top: 59mm; right: 38mm; font-weight: bold; }

.studentName { position: absolute; top: 69mm; left: 53mm; font-weight: bold; }
.fatherName { position: absolute; top: 78mm; left: 53mm; font-weight: bold; }
.motherName { position: absolute; top: 78mm; left: 145mm; font-weight: bold; }

/* ================= TOP HEADER (CLASS & SESSION) ================= */

.className {
  position: absolute;
  top: 42mm;
  left: 75mm;
  font-weight: bold;
  font-size: 15px;
}

.sessionStart {
  position: absolute;
  top: 42mm;
  left: 165mm;
  font-weight: bold;
  font-size: 15px;
}

.sessionEnd {
  position: absolute;
  top: 42mm;
  left: 185mm;
  font-weight: bold;
  font-size: 15px;
}

/* ================= TABLE ================= */

.marksTable {
  position: absolute;
  top: 95mm;
  left: 20mm;
  width: 170mm;
  border-collapse: collapse;
  font-size: 13px;
}

.marksTable th,
.marksTable td {
  border: 1px solid black;
  padding: 4px;
  text-align: center;
}

.totalRow {
  font-weight: bold;
}

/* ================= RESULT SUMMARY ================= */

.summary {
  position: absolute;
  top: 155mm;
  left: 25mm;
  width: 160mm;
  font-size: 14px;
}

.summary-row {
  display: flex;
  align-items: center;
  padding: 3px 0;
}

.summary-row strong {
  min-width: 120px;
  text-align: left;
}

.summary-row span {
  margin-left: 100px;
}

</style>
</head>

<body>

<div class="page">

  <div class="overlay">

    <!-- Top Header Data -->
    <div class="className">${student.className || ""}</div>
    <div class="sessionStart">${student.sessionStart || ""}</div>
    <div class="sessionEnd">${student.sessionEnd || ""}</div>

    <div class="scholarNo">${student.scholarNo}</div>

    <div class="dob">
      ${student.dob ? new Date(student.dob).toLocaleDateString("en-GB") : ""}
    </div>

    <div class="studentName">${student.name}</div>
    <div class="fatherName">${student.fatherName}</div>
    <div class="motherName">${student.motherName}</div>

    <!-- Marks Table -->
    <table class="marksTable">
      <thead>
        <tr>
          <th>Subject</th>
          <th>Max</th>
          <th>Min</th>
          <th>Quarterly</th>
          <th>Half Yearly</th>
          <th>Annual</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>

        ${student.subjects.map(sub => `
          <tr>
            <td>${sub.subjectName}</td>
            <td>${sub.maxMarks}</td>
            <td>${sub.minMarks}</td>
            <td>${sub.quarterly}</td>
            <td>${sub.halfYearly}</td>
            <td>${sub.annually}</td>
            <td>${sub.total}</td>
          </tr>
        `).join("")}

        <tr class="totalRow">
          <td colspan="6">Grand Total</td>
          <td>${student.grandTotal}</td>
        </tr>

      </tbody>
    </table>

    <!-- Result Summary -->
    <div class="summary">

      <div class="summary-row">
        <strong>Overall Percentage:</strong>
        <span>${student.overallPercentage}%</span>
      </div>

      <div class="summary-row">
        <strong>Division:</strong>
        <span>${student.division}</span>
      </div>

      <div class="summary-row">
        <strong>Grade:</strong>
        <span>${student.grade}</span>
      </div>

      <div class="summary-row">
        <strong>Result:</strong>
        <span>${student.result}</span>
      </div>

    </div>

  </div>
</div>

</body>
</html>
`;
};

module.exports = generateHTML;

// const bgPath = `file://${path.join(__dirname, "../public/templates/marksheet_bg.jpg")}`;
// // const bgPath = `file://${path.resolve("public/templates/marksheet_bg.png")}`;
// // console.log("Background Image Path:", bgPath);
// const path = require("path");
// const fs = require("fs");
// // Always resolve from project root
// const imagePath = path.resolve("public/templates/marksheet.jpg");
// //console.log("Resolved Background Image Path:", imagePath);

// const bgImage = fs.readFileSync(imagePath);

// const bgBase64 = `data:image/jpeg;base64,${bgImage.toString("base64")}`;

// const generateHTML = (student) => {
//     return `
// <!DOCTYPE html>
// <html>
// <head>
// <style>

// @page {
//   size: A4;
//   margin: 0;
// }

// body {
//   margin: 0;
//   padding: 0;
// }

// .page {
//   position: relative;
//   width: 210mm;
//   height: 297mm;
//   font-family: Arial, sans-serif;
// }

// .bg {
//   position: absolute;
//   width: 210mm;
//   height: 297mm;
//   top: 0;
//   left: 0;
// }

// .overlay {
//   position: relative;
//   width: 100%;
//   height: 100%;
//   font-size: 14px;
// }

// /* ================= HEADER FIELDS ================= */

// .scholarNo { position: absolute; top: 59mm; left: 38mm; font-weight: bold; }
// .dob { position: absolute; top: 59mm; right: 38mm; font-weight: bold;  }

// .studentName { position: absolute; top: 69mm; left: 53mm; font-weight: bold; }
// .fatherName { position: absolute; top: 78mm; left: 53mm; font-weight: bold; }
// .motherName { position: absolute; top: 78mm; left: 145mm; font-weight: bold; }

// /* ================= TABLE ================= */

// .marksTable {
//   position: absolute;
//   top: 95mm;
//   left: 20mm;
//   width: 170mm;
//   border-collapse: collapse;
//   font-size: 13px;
// }
// /* ================= TOP HEADER (CLASS & SESSION) ================= */

// .className {
//   position: absolute;
//   top: 42mm;
//   left: 75mm;   /* adjust if needed */
//   font-weight: bold;
//   font-size: 15px;
// }

// .sessionStart {
//   position: absolute;
//   top: 42mm;
//   left: 165mm; 
//   font-weight: bold;
//   font-size: 15px;
// }

// .sessionEnd {
//   position: absolute;
//   top: 42mm;
//   left: 185mm;  
//   font-weight: bold;
//   font-size: 15px;
// }
// .marksTable th,
// .marksTable td {
//   border: 1px solid black;
//   padding: 4px;
//   text-align: center;
// }

// .marksTable th {
//   font-weight: bold;
// }

// .totalRow {
//   font-weight: bold;
// }

// /* ================= RESULT SUMMARY ================= */

// .summary {
//   position: absolute;
//   top: 155mm;
//   left: 25mm;
//   width: 160mm;
//   font-size: 14px;
// }

// .summary-row {
//   display: flex;
//   align-items: center;       /* vertical center */
//   padding: 3px 0;
// }

// .summary-row strong {
//   min-width: 120px;          /* heading width */
//   text-align: left;
// }

// .summary-row span {
//   margin-left: 100px;        /* 100px gap from heading */
// }

// </style>
// </head>

// <body>

// <div class="page">

//   <img src="${bgBase64}" class="bg" />

//   <div class="overlay">

//     <!-- Top Header Data -->
// <div class="className">
//   ${student.className || ""}
// </div>

//   <!-- Start and End session separate -->
// <div class="sessionStart">
//   ${student.sessionStart || ""}
// </div>
// <div class="sessionEnd">
//   ${student.sessionEnd || ""}
// </div>
//     <div class="scholarNo">${student.scholarNo}</div>
//     <div class="dob">
//       ${student.dob ? new Date(student.dob).toLocaleDateString("en-GB") : ""}
//     </div>

//     <div class="studentName">${student.name}</div>
//     <div class="fatherName">${student.fatherName}</div>
//     <div class="motherName">${student.motherName}</div>

//     <!-- Marks Table -->
//     <table class="marksTable">
//       <thead>
//         <tr>
//           <th>Subject</th>
//           <th>Max</th>
//           <th>Min</th>
//           <th>Quarterly</th>
//           <th>Half Yearly</th>
//           <th>Annual</th>
//           <th>Total</th>
//         </tr>
//       </thead>
//       <tbody>

//         ${student.subjects.map(sub => `
//           <tr>
//             <td>${sub.subjectName}</td>
//             <td>${sub.maxMarks}</td>
//             <td>${sub.minMarks}</td>
//             <td>${sub.quarterly}</td>
//             <td>${sub.halfYearly}</td>
//             <td>${sub.annually}</td>
//             <td>${sub.total}</td>
//           </tr>
//         `).join("")}

//         <tr class="totalRow">
//           <td colspan="6">Grand Total</td>
//           <td>${student.grandTotal}</td>
//         </tr>

//       </tbody>
//     </table>

//     <!-- Result Summary Section -->
//     <div class="summary">

//       <div class="summary-row">
//         <strong>Overall Percentage:</strong>
//         <span>${student.overallPercentage}%</span>
//       </div>

//       <div class="summary-row">
//         <strong>Division:</strong>
//         <span class='value'>&nbsp;&nbsp;&nbsp;${student.division}</span>
//       </div>

//       <div class="summary-row">
//         <strong>Grade:</strong>
//         <span class='value'>&nbsp;&nbsp;&nbsp;${student.grade}</span>
//       </div>

//       <div class="summary-row">
//         <strong>Result:</strong>
//         <span class='value'>&nbsp;&nbsp;&nbsp;${student.result}</span>
//       </div>

//     </div>

//   </div>
// </div>

// </body>
// </html>
// `;
// };

// module.exports = generateHTML;