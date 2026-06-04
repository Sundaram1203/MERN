const Auth = require("../models/auth.model");
const { Validator } = require("node-input-validator");

// Replace rule placeholders in error messages
const replacePlaceholders = (message, rules) => {
  let result = message;
  if (rules && rules.match && rules.match(/maxLength:(\d+)/)) {
    result = result.replace(":maxLength", rules.match(/maxLength:(\d+)/)[1]);
  }
  if (rules && rules.match && rules.match(/minLength:(\d+)/)) {
    result = result.replace(":minLength", rules.match(/minLength:(\d+)/)[1]);
  }
  return result;
};

// Validate request body against rules
const validateRequest = async (req, rules, customMessages = {}) => {
  const v = new Validator(req.body, rules, customMessages);
  const matched = await v.check();

  if (!matched) {
    const firstErrorField = Object.keys(v.errors)[0];
    return {
      status: false,
      message: replacePlaceholders(
        v.errors[firstErrorField].message,
        rules[firstErrorField]
      )
    };
  }
  return { status: true };
};

// Shared custom messages
const customMessages = {
  required: ":attribute is required.",
  maxLength: ":attribute cannot be longer than :maxLength characters.",
  string: ":attribute must be a string.",
  integer: ":attribute must be an integer.",
  email: ":attribute must be a valid email address.",
  minLength: ":attribute should contain at least :minLength characters."
};

/**
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  const rules = {
    first_name: "required|string|maxLength:255",
    last_name: "required|string|maxLength:255",
    email: "required|email|maxLength:255",
    password: "required|string|minLength:8|maxLength:15"
  };

  const validation = await validateRequest(req, rules, customMessages);
  if (!validation.status) {
    return res.status(200).json(validation);
  }

  Auth.register(req.body, (err, data) => {
    if (err) {
      return res.status(500).json({ status: false, message: err.message || "Registration failed." });
    }
    res.json(data);
  });
};

/**
 * POST /api/auth/otp_verify
 */
exports.otp_verify = async (req, res) => {
  const rules = {
    otp: "required|integer",
    email: "required|email|maxLength:255",
    otp_time: "required|string|maxLength:100"
  };

  const validation = await validateRequest(req, rules, customMessages);
  if (!validation.status) {
    return res.status(200).json(validation);
  }

  Auth.otp_verify(req.body, (err, data) => {
    if (err) {
      return res.status(500).json({ status: false, message: err.message || "OTP verification failed." });
    }
    res.json(data);
  });
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  const rules = {
    email: "required|email|maxLength:255",
    password: "required|string|maxLength:255"
  };

  const validation = await validateRequest(req, rules, customMessages);
  if (!validation.status) {
    return res.status(200).json(validation);
  }

  Auth.login(req.body, (err, data) => {
    if (err) {
      return res.status(500).json({ status: false, message: err.message || "Login failed." });
    }
    res.json(data);
  });
};

/**
 * GET /api/auth/login_list
 */
exports.login_list = (req, res) => {
  Auth.login_list(req, res);
};

/**
 * POST /api/auth/login_view
 */
exports.login_view = async (req, res) => {
  const rules = { id: "required|integer" };
  const validation = await validateRequest(req, rules, customMessages);

  if (!validation.status) {
    return res.status(200).json(validation);
  }

  Auth.login_view(req.body, (err, data) => {
    if (err) {
      return res.status(500).json({ status: false, message: err.message || "Failed to retrieve user." });
    }
    res.json(data);
  });
};

/**
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  const rules = { user_id: "required|string|maxLength:255" };
  const validation = await validateRequest(req, rules, customMessages);

  if (!validation.status) {
    return res.status(200).json(validation);
  }

  Auth.logout(req.body, (err, data) => {
    if (err) {
      return res.status(500).json({ status: false, message: err.message || "Logout failed." });
    }
    res.json(data);
  });
};

/**
 * POST /api/auth/upload
 */
exports.upload = async (req, res) => {
  if (!req.file) {
    return res.status(200).json({ status: false, message: "Please upload an image." });
  }

  Auth.upload(req.file, (err, data) => {
    if (err) {
      return res.status(500).json({ status: false, message: err.message });
    }
    res.json(data);
  });
};
