const moment = require("moment-timezone");
const crypto = require("crypto");
const { sendRegisterMail } = require("../mail/sendmail");
const { readUsers, writeUsers, getNextId } = require("../config/jsonDb");

const Auth = {};

// Helper: MD5 hash
function md5Value(value) {
  return crypto.createHash("md5").update(value).digest("hex");
}

/**
 * Register a new user
 */
Auth.register = (data, result) => {
  try {
    const users = readUsers();

    const checkUser = users.find(
      (u) => u.email === data.email && u.deleted === 0
    );

    if (checkUser) {
      return result(null, {
        status: false,
        message: "Email already exists."
      });
    }

    const user_id = md5Value(data.email);
    const hash_password = md5Value(data.password);
    const otp = crypto.randomInt(100000, 1000000);
    const created_dt =
      data.created_dt ||
      moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

    const newUser = {
      id: getNextId(users),
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      user_id,
      password: data.password,
      hash_password,
      otp_code: otp,
      is_verified: 0,
      created_dt,
      updated_dt: created_dt,
      created_by: data.email,
      deleted: 0
    };

    users.push(newUser);
    writeUsers(users);

    const time = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

    sendRegisterMail({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      otp
    })
      .then(() => {
        result(null, {
          status: true,
          message: "User registered successfully. Please check your email for the OTP.",
          time
        });
      })
      .catch((mailErr) => {
        console.warn("Mail send failed (non-fatal):", mailErr.message);
        result(null, {
          status: true,
          message: "User registered successfully. Please check your email for the OTP.",
          time
        });
      });
  } catch (err) {
    console.error("Register error:", err);
    result(err, null);
  }
};

/**
 * Verify OTP
 */
Auth.otp_verify = (data, result) => {
  try {
    const otpTime = new Date(data.otp_time);
    const currentTime = new Date();
    const diffInMinutes = (currentTime - otpTime) / (1000 * 60);

    if (diffInMinutes >= 5) {
      return result(null, {
        status: false,
        message: "OTP has expired. Please request a new OTP."
      });
    }

    const users = readUsers();
    const user = users.find((u) => u.email === data.email && u.deleted === 0);

    if (!user) {
      return result(null, {
        status: false,
        message: "No user found with the provided email address."
      });
    }

    if (String(user.otp_code) === String(data.otp)) {
      user.is_verified = 1;
      user.updated_dt = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
      writeUsers(users);
      result(null, { status: true, message: "OTP verified successfully. You can now log in." });
    } else {
      result(null, { status: false, message: "Invalid OTP. Please enter the correct OTP." });
    }
  } catch (err) {
    console.error("OTP verify error:", err);
    result(err, null);
  }
};

/**
 * Login user
 */
Auth.login = (data, result) => {
  try {
    const users = readUsers();
    const user = users.find(
      (u) =>
        u.email === data.email &&
        u.password === data.password &&
        u.deleted === 0
    );

    if (user) {
      result(null, {
        status: true,
        message: "Login successful.",
        data: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          user_id: user.user_id
        }
      });
    } else {
      result(null, { status: false, message: "Invalid email or password." });
    }
  } catch (err) {
    console.error("Login error:", err);
    result(err, null);
  }
};

/**
 * Get all users list
 */
Auth.login_list = (req, res) => {
  try {
    const users = readUsers()
      .filter((u) => u.deleted === 0)
      .sort((a, b) => b.id - a.id)
      .map((u) => ({
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email
      }));

    if (users.length === 0) {
      return res.status(404).json({ status: false, message: "No users found." });
    }

    return res.status(200).json({
      status: true,
      message: "Users retrieved successfully.",
      result: users
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

/**
 * View single user
 */
Auth.login_view = (data, result) => {
  try {
    const users = readUsers();
    const user = users.find(
      (u) => u.id === Number(data.id) && u.deleted === 0
    );

    if (user) {
      result(null, {
        status: true,
        message: "User details retrieved successfully.",
        data: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          user_id: user.user_id
        }
      });
    } else {
      result(null, { status: false, message: "User not found." });
    }
  } catch (err) {
    console.error("Login view error:", err);
    result(err, null);
  }
};

/**
 * Logout user
 */
Auth.logout = (data, result) => {
  try {
    const users = readUsers();
    const user = users.find(
      (u) => u.user_id === data.user_id && u.deleted === 0
    );

    if (user) {
      user.updated_dt = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
      writeUsers(users);
    }

    // Even if no matching user_id, clear session gracefully on the client side
    result(null, { status: true, message: "You have successfully logged out!" });
  } catch (err) {
    console.error("Logout error:", err);
    result(err, null);
  }
};

/**
 * Upload profile image
 */
Auth.upload = (file, result) => {
  result(null, {
    status: true,
    message: "Profile image uploaded successfully.",
    data: {
      original_name: file.originalname,
      profile_name: file.filename,
      profile_path: `/uploads/profile/${file.filename}`
    }
  });
};

module.exports = Auth;
