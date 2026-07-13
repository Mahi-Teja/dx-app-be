import * as authService from "./auth.service.js";
import { ApiResponse } from "../../helpers/AppResponse.js";
import env from "../../config/env.js";
import AppError from "../../helpers/AppError.js";
import { sendMail, transport } from "../../helpers/sendEmail.js";
import { resetPasswordTemplate } from "../../helpers/resetEmailTemplate.js";

export async function googleAuth(req, res) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "ID token required" });
    }

    const result = await authService.googleAuthentication(idToken);

    res.cookie("access_token", result.accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json(
      new ApiResponse({
        statusCode: 201,
        data: result,
        message: "Google login successful",
      })
    );
  } catch (err) {
    console.error(err);

    if (err.message === "EMAIL_NOT_VERIFIED") {
      return res.status(401).json({ message: "Email not verified" });
    }

    return res.status(401).json({ message: "Invalid Google token" });
  }
}
/**
 * ---------------------------------------------------
 * Register
 * POST /auth/register
 * ---------------------------------------------------
 */
export const register = async (req, res) => {
  const user = await authService.register(req.body);

  res.status(201).json(
    new ApiResponse({
      statusCode: 201,
      data: user,
      message: "User registered successfully",
    })
  );
};

/**
 * ---------------------------------------------------
 * Login
 * POST /auth/login
 * ---------------------------------------------------
 */
export const login = async (req, res) => {
  const { user, accessToken } = await authService.login(req.body);

  const isProd = env.NODE_ENV === "production";

  // res.cookie("access_token", accessToken, {
  //   httpOnly: true,
  //   secure: isProd,
  //   sameSite: isProd ? "none" : "lax",
  //   maxAge: 7 * 24 * 60 * 60 * 1000,
  // });
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: true, // ALWAYS true on Vercel
    sameSite: "none", // REQUIRED for Netlify -> Vercel
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: user,
      message: "Login successful",
    })
  );
};
/**
 * ---------------------------------------------------
 * Logout User
 * POST /auth/logout
 * ---------------------------------------------------
 */
export const logout = async (req, res) => {
  // res.clearCookie("access_token", {
  //   httpOnly: true,
  //   secure: env.NODE_ENV === "production",
  //   sameSite: "strict",
  // });
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: null,
      message: "Logout successful",
    })
  );
};

const RESET_PASSWORD_RESPONSE =
  "If an account exists with that email, a password reset link has been sent.";

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const result = await authService.forgotPassword({ email });

  if (result) {
    const { token, user } = result;

    try {
      const clientUrl = req.get("origin") || env.CLIENT_URL || "https://dxapp.anempty.com";

      const resetUrl = `${clientUrl}/verify-reset-password/${token}`;

      await sendMail({
        to: user.email,
        subject: "Reset your password",
        html: resetPasswordTemplate(resetUrl),
      });
    } catch (error) {
      await authService.clearResetToken(user._id);
      throw error;
    }
  }

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: null,
      message: RESET_PASSWORD_RESPONSE,
    })
  );
};

export const verifyResetPassword = async (req, res) => {
  const { token } = req.params;

  const isValid = await authService.verifyResetPassword({ token });

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: { isValid },
      message: isValid ? "Reset token is valid." : "Reset link is invalid or has expired.",
    })
  );
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  await authService.resetPassword({
    token,
    newPassword,
    confirmPassword,
  });

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: null,
      message: "Password has been reset successfully.",
    })
  );
};
