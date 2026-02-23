const bcrypt = require("bcryptjs");
const User = require("../../models/user/User");
const { generateToken, expireToken } = require("../../utils/helpers");
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHandler");


exports.register = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, `Email "${email}" already registered.`, 400);
    }
    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      mobile: mobile,
    });
    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: expireToken(),
    });
   
    return successResponse(
      res,
      {
        msg: "User registered successfully.",
        user: { ...user.toObject(), token },
      },
      201,
    );
  } catch (err) {
    return errorResponse(res, "Server error occurred", 500, err.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { u_mobile } = req.body;
    const user = await User.findOne({ u_mobile });
    if (!user) return errorResponse(res, "Invalid credentials", 400);
    if (user.status !== "Active") {
      return errorResponse(
        res,
        "Your account has been deleted or deactivated",
        403,
      );
    }

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: expireToken(),
    });

    return successResponse(res, {
      msg: "Login successful",
      user: { ...user.toObject(), token },
    });
  } catch (err) {
    return errorResponse(res, "Server error occurred", 500, err.message);
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id, "-u_password");
    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, { msg: "User retrieved successfully", user });
  } catch (err) {
    return errorResponse(res, "Server error occurred", 500, err.message);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { status, search } = req.query;

    const matchQuery = {};
    if (status) matchQuery.status = status;
    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const pipeline = [
      { $match: matchQuery },
      { $project: { password: 0 } },
    ]
    const skip = (page - 1) * limit;
    const totalPipline = [{ $match: matchQuery }, { $count: "total" }];

    const [totalResult] = await User.aggregate(totalPipline);
    const total = totalResult ? totalResult.total : 0;


    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      limit: limit,
    };

    return successResponse(res, {
      success: true,
      msg: "Users list fetched successfully",
      results: formattedResults,
      pagination,
    });
  } catch (err) {
    console.error("Error in getUsers:", err);
    return errorResponse(res, "Server error", 500);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(id, updates, { new: true });

    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, {
      msg: "User updated successfully",
      userId: user._id,
    });
  } catch (err) {
    return errorResponse(res, "Server error occurred", 500, err.message);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findById(id);
    if (!deletedUser) return errorResponse(res, "User not found", 404);

    await User.findByIdAndDelete(id);

    return successResponse(res, {
      msg: "User deleted successfully",
      userId: id,
    });
  } catch (err) {
    return errorResponse(res, "Server error occurred", 500, err.message);
  }
};

exports.deleteMultiple = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, "Invalid or empty 'ids' array", 400);
    }

    const users = await User.find({ _id: { $in: ids } });
    if (!users || users.length === 0) {
      return errorResponse(res, "Users not found", 404);
    }

    const result = await User.deleteMany({ _id: { $in: ids } });

    return successResponse(res, {
      msg: "Users deleted successfully",
      deletedCount: result.deletedCount,
      deletedUserIds: ids,
    });
  } catch (err) {
    return errorResponse(res, "Server error occurred", 500, err.message);
  }
};

exports.logout = (req, res) => {
  try {
    res.clearCookie("token");
    return successResponse(res, { msg: "Logout successful" });
  } catch (err) {
    return errorResponse(res, "Server error occurred", 500, err.message);
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    res.json({
      success: true,
      msg: "User retrieved successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, msg: "Server error", error: err.message });
  }
};
