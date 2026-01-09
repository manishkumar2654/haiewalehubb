const User = require("../models/User");
const AppError = require("../utils/appError");
const { OAuth2Client } = require("google-auth-library");
const { auth } = require("../config/firebase");
const crypto = require("crypto");
const sendEmail = require("../utils/email");
const logger = require("../utils/logger"); // Winston logger instance

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to log error and pass to next middleware
const logAndNext = (msg, err, next) => {
  logger.error(`${msg} - ${err.message}`, { stack: err.stack });
  next(err);
};

// ✅ Register User (supports employee registration with extra fields)
exports.register = async (req, res, next) => {
  try {
    logger.debug("REGISTER: Incoming request body: %o", req.body);

    const {
      name,
      email,
      password,
      phone,
      role,
      employeeRole,
      shift,
      workingLocation,
      status,
    } = req.body;

    logger.info(`REGISTER: Checking if user exists with email: ${email}`);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`REGISTER: Email already in use: ${email}`);
      return next(new AppError("Email already in use", 400));
    }

    const userData = { name, email, password, phone, role };

    if (role === "employee") {
      logger.debug(
        "REGISTER: Employee registration detected, validating employee fields"
      );
      if (!employeeRole || !shift || !workingLocation) {
        logger.warn(
          `REGISTER: Missing employee fields - employeeRole=${employeeRole}, shift=${shift}, workingLocation=${workingLocation}`
        );
        return next(
          new AppError(
            "employeeRole, shift, and workingLocation are required for employees",
            400
          )
        );
      }
      userData.employeeRole = employeeRole;
      userData.shift = shift;
      userData.workingLocation = workingLocation;

      if (employeeRole === "servicestaff" && status) {
        userData.status = status;
      }
    }

    logger.info("REGISTER: Creating user");
    const user = await User.create(userData);
    logger.info(`REGISTER: User created with ID: ${user._id}`);

    const token = user.generateAuthToken();
    logger.debug(`REGISTER: JWT token generated for user ID: ${user._id}`);

    res.status(201).json({
      status: "success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        ...(role === "employee" && {
          employeeRole: user.employeeRole,
          shift: user.shift,
          workingLocation: user.workingLocation,
          status: user.status,
          employeeId: user.employeeId,
        }),
      },
    });
  } catch (err) {
    logAndNext("REGISTER: Error during registration", err, next);
  }
};

// Helper function to merge carts
function mergeCarts(existingCart = [], guestCart = []) {
  logger.debug("[MERGECARTS] Merging carts");
  const merged = [...existingCart];

  for (const guestItem of guestCart) {
    const guestProductId =
      typeof guestItem.product === "string"
        ? guestItem.product
        : guestItem.product.toString();

    const index = merged.findIndex((item) => {
      const existingProductId =
        typeof item.product === "string"
          ? item.product
          : item.product.toString();

      return (
        existingProductId === guestProductId &&
        item.size === guestItem.size &&
        item.color === guestItem.color
      );
    });

    if (index !== -1) {
      merged[index].quantity += guestItem.quantity || 1;
      logger.debug(
        `[MERGECARTS] Merged quantity for product ${guestProductId} at index ${index}`
      );
    } else {
      merged.push({
        product: guestProductId, // ensure string ID
        size: guestItem.size,
        color: guestItem.color,
        quantity: guestItem.quantity || 1,
      });
      logger.debug(`[MERGECARTS] Added new product to cart: ${guestProductId}`);
    }
  }

  return merged;
}

// ✅ Login
exports.login = async (req, res, next) => {
  try {
    const { email, password, guestCart = [] } = req.body;
    logger.info(`LOGIN: Attempting login for email: ${email}`);

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      logger.warn(`LOGIN: User not found for email: ${email}`);
      return res
        .status(401)
        .json({ message: "Invalid credentials (user not found)" });
    }

    const isMatch = await user.comparePassword(password);
    logger.debug(`LOGIN: Password match for email ${email}: ${isMatch}`);

    if (!isMatch) {
      logger.warn(`LOGIN: Password mismatch for email: ${email}`);
      return res
        .status(401)
        .json({ message: "Invalid credentials (wrong password)" });
    }

    // Merge guest cart into existing user cart
    if (guestCart.length > 0) {
      user.cart = mergeCarts(user.cart || [], guestCart);
      logger.debug("LOGIN: Merged guest cart into user cart");
    }

    await user.save();

    const token = user.generateAuthToken();
    user.password = undefined;

    logger.info(`LOGIN: Login successful for user ID: ${user._id}`);

    res.status(200).json({
      status: "success",
      token,
      user,
    });
  } catch (err) {
    logAndNext("LOGIN: Error during login", err, next);
  }
};

// ✅ Update Employee Info (admin only)
exports.updateEmployee = async (req, res, next) => {
  try {
    logger.info(
      `[UPDATE_EMPLOYEE] User ${req.user._id} attempting to update employee ${req.params.id}`
    );

    if (req.user.role !== "admin") {
      logger.warn(
        `[UPDATE_EMPLOYEE] Unauthorized update attempt by user ${req.user._id} with role ${req.user.role}`
      );
      return next(new AppError("Only admins can update employee info", 403));
    }

    const { employeeRole, shift, workingLocation, status } = req.body;
    logger.debug(
      `[UPDATE_EMPLOYEE] Update payload: employeeRole=${employeeRole}, shift=${shift}, workingLocation=${workingLocation}, status=${status}`
    );

    const updateData = {};
    if (employeeRole) updateData.employeeRole = employeeRole;
    if (shift) updateData.shift = shift;
    if (workingLocation) updateData.workingLocation = workingLocation;
    if (status) updateData.status = status;

    const user = await User.findById(req.params.id);
    if (!user) {
      logger.warn(
        `[UPDATE_EMPLOYEE] Employee not found with id: ${req.params.id}`
      );
      return next(new AppError("User not found", 404));
    }

    if (user.role !== "employee") {
      logger.warn(
        `[UPDATE_EMPLOYEE] Target user is not an employee: ${user._id}`
      );
      return next(new AppError("User is not an employee", 400));
    }

    Object.assign(user, updateData);
    await user.save();

    logger.info(`[UPDATE_EMPLOYEE] Employee info updated for id: ${user._id}`);

    res.status(200).json({
      status: "success",
      message: "Employee info updated",
      user,
    });
  } catch (err) {
    logAndNext("[UPDATE_EMPLOYEE] Error updating employee info", err, next);
  }
};

// ✅ Google OAuth Login
// ✅ Google OAuth Login
exports.googleLogin = async (req, res, next) => {
  try {
    const { tokenId } = req.body;
    logger.info("[GOOGLE_LOGIN] Verifying Google token");

    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, email_verified } = ticket.getPayload();
    logger.info(`[GOOGLE_LOGIN] Token verified for email: ${email}`);

    let user = await User.findOne({ email });
    if (!user) {
      logger.info("[GOOGLE_LOGIN] User not found, creating new user");
      user = await User.create({
        name,
        email,
        password: email + Math.random().toString(36).slice(-8),
        isEmailVerified: true, // ✅ Set to true for Google OAuth users
      });
      logger.info(`[GOOGLE_LOGIN] Created new user with ID: ${user._id}`);
    } else {
      // ✅ Update existing user's email verification status if they login with Google
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        await user.save();
        logger.info(
          `[GOOGLE_LOGIN] Updated email verification status for existing user: ${user._id}`
        );
      }
    }

    const token = user.generateAuthToken();
    logger.debug(`[GOOGLE_LOGIN] Generated JWT token for user ID: ${user._id}`);

    res.status(200).json({
      status: "success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified, // ✅ This will now be true
        isPhoneVerified: user.isPhoneVerified,
        phone: user.phone || null,
        // Include employee fields if user is an employee
        ...(user.role === "employee" && {
          employeeRole: user.employeeRole,
          shift: user.shift,
          workingLocation: user.workingLocation,
          status: user.status,
          employeeId: user.employeeId,
        }),
      },
    });
  } catch (err) {
    logAndNext("[GOOGLE_LOGIN] Error during Google OAuth login", err, next);
  }
};

// ✅ Send OTP (frontend handled)
exports.sendPhoneVerification = async (req, res, next) => {
  try {
    logger.info(`[SEND_PHONE_VERIFICATION] Request by user ${req.user._id}`);
    res.status(200).json({
      status: "success",
      message: "Use Firebase SDK on frontend to send OTP.",
    });
  } catch (err) {
    logAndNext("[SEND_PHONE_VERIFICATION] Error", err, next);
  }
};

// ✅ Verify Phone
exports.verifyPhone = async (req, res, next) => {
  try {
    const { firebaseIdToken, phone } = req.body;
    logger.info(`[VERIFY_PHONE] User ${req.user._id} verifying phone number`);

    const decoded = await auth.verifyIdToken(firebaseIdToken);
    logger.debug(
      `[VERIFY_PHONE] Firebase token phone number: ${decoded.phone_number}`
    );

    if (!decoded.phone_number || decoded.phone_number !== phone) {
      logger.warn(
        `[VERIFY_PHONE] Phone number mismatch: token=${decoded.phone_number}, input=${phone}`
      );
      return next(new AppError("Phone number does not match token", 400));
    }

    const existingUser = await User.findOne({ phone });
    if (
      existingUser &&
      existingUser._id.toString() !== req.user._id.toString()
    ) {
      logger.warn(
        `[VERIFY_PHONE] Phone number ${phone} already in use by another user`
      );
      return next(new AppError("Phone number already in use", 400));
    }

    req.user.phone = phone;
    req.user.isPhoneVerified = true;
    await req.user.save();

    logger.info(
      `[VERIFY_PHONE] Phone verified successfully for user ${req.user._id}`
    );

    res.status(200).json({
      status: "success",
      message: "Phone verified successfully",
      user: {
        id: req.user._id,
        phone: req.user.phone,
        isPhoneVerified: req.user.isPhoneVerified,
      },
    });
  } catch (err) {
    logAndNext("[VERIFY_PHONE] Error verifying phone", err, next);
  }
};

// ✅ Send Verification Email
exports.sendVerificationEmail = async (req, res, next) => {
  try {
    logger.info(`[SEND_VERIFICATION_EMAIL] Request by user ${req.user._id}`);

    const user = await User.findById(req.user.id);
    if (!user) {
      logger.warn(`[SEND_VERIFICATION_EMAIL] User not found: ${req.user.id}`);
      return next(new AppError("User not found", 404));
    }

    if (user.isEmailVerified) {
      logger.info(
        `[SEND_VERIFICATION_EMAIL] Email already verified for user ${user._id}`
      );
      return next(new AppError("Email is already verified", 400));
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hrs

    await user.save({ validateBeforeSave: false });
    logger.debug(
      `[SEND_VERIFICATION_EMAIL] Email verification token stored for user ${user._id}`
    );

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Verify your Email - S.Tatsaya",
        name: user.name,
        message:
          "Click the button below to verify your email and get started with S.Tatsaya.",
        buttonText: "Verify Email",
        link: verificationUrl,
      });
      logger.info(
        `[SEND_VERIFICATION_EMAIL] Verification email sent to ${user.email}`
      );

      res.status(200).json({
        status: "success",
        message: "Verification email sent successfully",
      });
    } catch (emailErr) {
      logger.error("[SEND_VERIFICATION_EMAIL] Email sending error", {
        error: emailErr,
      });

      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          "There was an error sending the email. Try again later!",
          500
        )
      );
    }
  } catch (err) {
    logAndNext("[SEND_VERIFICATION_EMAIL] Error", err, next);
  }
};

// ✅ Verify Email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    logger.info(`[VERIFY_EMAIL] Verifying email with token: ${token}`);

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      logger.warn("[VERIFY_EMAIL] Token invalid or expired");
      return next(new AppError("Token is invalid or has expired", 400));
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    logger.info(`[VERIFY_EMAIL] Email verified for user ${user._id}`);

    res.status(200).json({
      status: "success",
      message: "Email verified successfully",
    });
  } catch (err) {
    logAndNext("[VERIFY_EMAIL] Error", err, next);
  }
};

// ✅ Forgot Password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    logger.info(
      `[FORGOT_PASSWORD] Password reset requested for email: ${email}`
    );

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`[FORGOT_PASSWORD] No user found with email: ${email}`);
      return next(new AppError("No user found with that email", 404));
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min

    await user.save({ validateBeforeSave: false });
    logger.debug(
      `[FORGOT_PASSWORD] Reset token generated for user ${user._id}`
    );

    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset - S.Tatsaya",
      name: user.name,
      message: `We received a password reset request. Click below to reset your password.`,
      buttonText: "Reset Password",
      link: resetUrl,
    });
    logger.info(`[FORGOT_PASSWORD] Password reset email sent to ${email}`);

    res.status(200).json({
      status: "success",
      message: "Password reset email sent",
    });
  } catch (err) {
    logAndNext("[FORGOT_PASSWORD] Error", err, next);
  }
};

// ✅ Reset Password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    logger.info(`[RESET_PASSWORD] Resetting password using token: ${token}`);

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      logger.warn("[RESET_PASSWORD] Token invalid or expired");
      return next(new AppError("Token is invalid or has expired", 400));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    logger.info(
      `[RESET_PASSWORD] Password reset successfully for user ${user._id}`
    );

    res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (err) {
    logAndNext("[RESET_PASSWORD] Error", err, next);
  }
};

// Get logged-in user's profile with all details
exports.getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch user by id and include sensitive info as needed
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      user,
    });
  } catch (err) {
    logger.error(
      `[GET_USER_PROFILE] Error fetching user profile for ${req.user._id}`,
      { stack: err.stack }
    );
    next(err);
  }
};
