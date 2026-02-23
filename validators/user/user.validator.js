const { check } = require('express-validator');

exports.registerValidator = [
  check("u_name").notEmpty().withMessage("Name is required"),
  check("u_email").isEmail().withMessage("Valid email is required"),
  check("u_password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  check("u_mobile")
    .isMobilePhone()
    .withMessage("Valid mobile number is required"),
];

exports.loginValidator = [
  check('u_mobile').isMobilePhone().withMessage('Valid mobile number is required').exists().withMessage('Mobile number is required'),
  check('u_password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').exists().withMessage('Password is required'),
];
