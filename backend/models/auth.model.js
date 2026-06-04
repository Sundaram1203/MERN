const sql = require("../config/db");
const moment = require("moment-timezone");
const crypto = require("crypto");
const { sendRegisterMail } = require("../mail/sendmail");

const Auth = {};

// Helper: MD5 hash
function md5Value(value) {
  return crypto.createHash("md5").update(value).digest("hex");
}

/**
 * Register a new user
 */
Auth.register = (data, result) => {
  sql.query(
    "SELECT id FROM swag_user_master WHERE email = ? AND deleted = 0",
    [data.email],
    (err, checkUser) => {
      if (err) {
        console.error("Register check error:", err);
        return result(err, null);
      }

      if (checkUser.length > 0) {
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

      const insertData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        user_id,
        password: data.password,
        hash_password,
        otp_code: otp,
        created_dt,
        created_by: data.email
      };

      sql.query("INSERT INTO swag_user_master SET ?", insertData, (err, res_register) => {
        if (err) {
          console.error("Register insert error:", err);
          return result(err, null);
        }

        if (res_register.affectedRows > 0) {
          const time = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

          sendRegisterMail({ first_name: data.first_name, last_name: data.last_name, email: data.email, otp })
            .then(() => {
              result(null, { status: true, message: "User registered successfully. Please check your email for the OTP.", time });
            })
            .catch((mailErr) => {
              console.warn("Mail send failed (non-fatal):", mailErr.message);
              result(null, { status: true, message: "User registered successfully. Please check your email for the OTP.", time });
            });
        } else {
          result(null, { status: false, message: "Unable to register user." });
        }
      });
    }
  );
};

/**
 * Verify OTP
 */
Auth.otp_verify = (data, result) => {
  const otpTime = new Date(data.otp_time);
  const currentTime = new Date();
  const diffInMinutes = (currentTime - otpTime) / (1000 * 60);

  if (diffInMinutes >= 5) {
    return result(null, {
      status: false,
      message: "OTP has expired. Please request a new OTP."
    });
  }

  sql.query(
    "SELECT otp_code FROM swag_user_master WHERE email = ? AND deleted = 0",
    [data.email],
    (err, res_check_user) => {
      if (err) {
        console.error("OTP verify error:", err);
        return result(err, null);
      }

      if (res_check_user.length === 0) {
        return result(null, { status: false, message: "No user found with the provided email address." });
      }

      if (String(res_check_user[0].otp_code) === String(data.otp)) {
        // Mark user as verified
        sql.query(
          "UPDATE swag_user_master SET is_verified = 1 WHERE email = ?",
          [data.email],
          () => {} // Non-blocking update
        );
        result(null, { status: true, message: "OTP verified successfully. You can now log in." });
      } else {
        result(null, { status: false, message: "Invalid OTP. Please enter the correct OTP." });
      }
    }
  );
};

/**
 * Login user
 */
Auth.login = (data, result) => {
  sql.query(
    `SELECT id, first_name, last_name, email, user_id
     FROM swag_user_master
     WHERE email = ? AND password = ? AND deleted = 0`,
    [data.email, data.password],
    (err, res_login) => {
      if (err) {
        console.error("Login error:", err);
        return result(err, null);
      }

      if (res_login.length > 0) {
        result(null, {
          status: true,
          message: "Login successful.",
          data: res_login[0]
        });
      } else {
        result(null, { status: false, message: "Invalid email or password." });
      }
    }
  );
};

/**
 * Get all users list
 */
Auth.login_list = (req, res) => {
  sql.query(
    "SELECT id, first_name, last_name, email FROM swag_user_master WHERE deleted = 0 ORDER BY id DESC",
    (err, result) => {
      if (err) {
        return res.status(500).json({ status: false, message: err.message });
      }

      if (result.length === 0) {
        return res.status(404).json({ status: false, message: "No users found." });
      }

      return res.status(200).json({ status: true, message: "Users retrieved successfully.", result });
    }
  );
};

/**
 * View single user
 */
Auth.login_view = (data, result) => {
  sql.query(
    "SELECT id, first_name, last_name, email, user_id FROM swag_user_master WHERE deleted = 0 AND id = ?",
    [data.id],
    (err, res_view) => {
      if (err) {
        console.error("Login view error:", err);
        return result(err, null);
      }

      if (res_view.length > 0) {
        result(null, { status: true, message: "User details retrieved successfully.", data: res_view[0] });
      } else {
        result(null, { status: false, message: "User not found." });
      }
    }
  );
};

/**
 * Logout user - fixed to use correct table (swag_user_master)
 */
Auth.logout = (data, result) => {
  const lastLogout = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

  // Update last logout time in swag_user_master
  sql.query(
    "UPDATE swag_user_master SET updated_dt = ? WHERE user_id = ? AND deleted = 0",
    [lastLogout, data.user_id],
    (err, res_logout) => {
      if (err) {
        console.error("Logout error:", err);
        return result(err, null);
      }

      // Even if no rows updated (user_id mismatch), clear session gracefully
      result(null, { status: true, message: "You have successfully logged out!" });
    }
  );
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
