const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const routes = require("./routes/index");
dotenv.config();
const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      //console.log("Request from Origin:", origin); 
      callback(null, origin || true);
    },
    credentials: true,
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));
app.use("/excelFile", express.static(path.join(__dirname, "excelFile")));
app.use("/templates", express.static(path.join(__dirname, "public/templates")));
connectDB();

app.get("/", (req, res) => {
  res.send("Welcome to the Vendor Panel");
});

app.use("/api", routes);

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({
    success: false,
    msg: "Server error occurred",
    error: err.message,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

