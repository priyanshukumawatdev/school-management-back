
exports.successResponse = (res, data = {}, status = 200) => {
  return res.status(status).json({ success: true, ...data });
};

exports.errorResponse = (res, msg = "Something went wrong", status = 500, error = null) => {
  return res.status(status).json({ success: false, msg, error });
};
