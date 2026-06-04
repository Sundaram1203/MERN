const router = require("express").Router();
const auth = require("../controllers/auth.controller");
const upload = require("../middleware/upload");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - User Module
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Test@1234
 *     responses:
 *       200:
 *         description: User registered successfully
 */
router.post("/register", auth.register);

/**
 * @swagger
 * /api/auth/otp_verify:
 *   post:
 *     summary: Verify OTP sent to user email
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - email
 *               - otp_time
 *             properties:
 *               otp:
 *                 type: integer
 *                 example: 123456
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               otp_time:
 *                 type: string
 *                 example: 2025-06-02 10:30:00
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
router.post("/otp_verify", auth.otp_verify);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - User Module
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Test@1234
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", auth.login);

/**
 * @swagger
 * /api/auth/login_list:
 *   get:
 *     summary: Get all registered users
 *     tags:
 *       - User Module
 *     responses:
 *       200:
 *         description: User list retrieved successfully
 *       404:
 *         description: No users found
 */
router.get("/login_list", auth.login_list);

/**
 * @swagger
 * /api/auth/login_view:
 *   post:
 *     summary: View details of a specific user
 *     tags:
 *       - User Module
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 */
router.post("/login_view", auth.login_view);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags:
 *       - User Module
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: e60ad9e929fcc7e211c582fb5930e1d4
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", auth.logout);

/**
 * @swagger
 * /api/auth/upload:
 *   post:
 *     summary: Upload profile image
 *     tags:
 *       - User Module
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 */
router.post("/upload", upload.single("image"), auth.upload);

module.exports = router;
