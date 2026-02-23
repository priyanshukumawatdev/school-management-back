const fs = require("fs");
const path = require("path");


const deleteSingleFile = (folder, filename) => {
  try {
    if (!folder || !filename) return;

    const filePath = path.join(__dirname, "..", "uploads", folder, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted image successfully: ${filePath}`);
    }
  } catch (err) {
    console.error(`Failed to delete image: ${filename}`, err.message);
  }
};

module.exports = deleteSingleFile;
