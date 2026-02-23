const multer = require("multer");
const path = require("path");

const allowedMimeTypes = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

const allowedExtensions = [".xlsx", ".xls"];

const fileExcelUpload = ({
  fieldName = "file",
  maxSizeMB = 5,
} = {}) => {

  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only Excel files allowed"));
    }

    if (!allowedExtensions.includes(ext)) {
      return cb(new Error("Invalid file extension"));
    }

    cb(null, true);
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
  });

  return upload.single(fieldName);
};

module.exports = fileExcelUpload;



// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("../config/cloudinary");
// const path = require("path");

// const allowedMimeTypes = [
//   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   "application/vnd.ms-excel",
// ];

// const allowedExtensions = [".xlsx", ".xls"];

// const fileExcelUpload = ({
//   folder = "main",
//   fieldName = "file",
//   maxSizeMB = 5,
// } = {}) => {

//   const storage = new CloudinaryStorage({
//     cloudinary,
//     params: async (req, file) => {
//       const ext = path.extname(file.originalname).toLowerCase();

//       return {
//         folder: folder, // 👈 dynamic folder
//         resource_type: "raw",
//         public_id: `${Date.now()}-${file.originalname.replace(ext, "")}`,
//       };
//     },
//   });

//   const fileFilter = (req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();

//     if (!allowedMimeTypes.includes(file.mimetype)) {
//       return cb(new Error("Only Excel files (.xlsx, .xls) allowed"));
//     }

//     if (!allowedExtensions.includes(ext)) {
//       return cb(new Error("Invalid file extension"));
//     }

//     cb(null, true);
//   };

//   const upload = multer({
//     storage,
//     fileFilter,
//     limits: {
//       fileSize: maxSizeMB * 1024 * 1024,
//     },
//   });

//   return (req, res, next) => {
//     upload.single(fieldName)(req, res, (err) => {
//       if (err instanceof multer.MulterError) {
//         if (err.code === "LIMIT_FILE_SIZE") {
//           return res.status(400).json({
//             success: false,
//             message: `File too large (max ${maxSizeMB}MB)`,
//           });
//         }
//       }

//       if (err) {
//         return res.status(400).json({
//           success: false,
//           message: err.message,
//         });
//       }

//       if (!req.file) {
//         return res.status(400).json({
//           success: false,
//           message: "No file uploaded",
//         });
//       }

//       next();
//     });
//   };
// };

// module.exports = fileExcelUpload;
