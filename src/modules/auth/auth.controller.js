import * as authService from "./auth.service.js";
import { ApiResponse } from "../../helpers/AppResponse.js";

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

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: user,
      message: "Login successful",
    })
  );
};
export { login, register };
