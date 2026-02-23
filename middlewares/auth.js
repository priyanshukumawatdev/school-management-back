const jwt = require("jsonwebtoken");
const User = require("../models/user/User");


exports.jwtVerify = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ success: false, msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let currentUser = await User.findById(decoded.userid).select("-password");
    if (!currentUser) {
      return res.status(401).json({ success: false, msg: "Invalid token" });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({ success: false, msg: "Invalid token provided" });
  }
};

exports.roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, msg: "Unauthorized access" });

    const hasRole = roles.includes(req.user.role);
    if (!hasRole) return res.status(403).json({ success: false, msg: "Forbidden you are not allowed to access this resource" });

    next();
  };
};


