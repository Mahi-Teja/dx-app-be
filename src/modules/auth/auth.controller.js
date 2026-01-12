import * as authService from "./auth.service.js";
import { ApiResponse } from "../../helpers/AppResponse.js";
import env from "../../config/env.js";

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
