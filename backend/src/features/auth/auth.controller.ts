import type { ServerResponse } from "node:http";
import { z } from "zod";
import { loginDto, registerDto } from "./auth.dto";
import type { AuthService } from "./auth.service";

/**
 * The AuthController class handles all authentication-related operations
 * such as user registration, login, token refresh, and logout.
 */
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookies(res: ServerResponse, tokens: { accessToken: string; refreshToken: string }) {
    const { accessToken, refreshToken } = tokens;

    res.setHeader("Set-Cookie", [
      `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=900; SameSite=Strict`,
      `refreshToken=${refreshToken}; HttpOnly; Path=/auth; Max-Age=604800; SameSite=Strict`,
    ]);
  }

  async register(reqBody: unknown, res: ServerResponse) {
    const parsed = registerDto.safeParse(reqBody);
    if (!parsed.success) {
      res.statusCode = 400;
      return { error: z.treeifyError(parsed.error) };
    }

    const user = await this.authService.register(parsed.data);
    res.statusCode = 201;
    return { user };
  }

  async login(reqBody: unknown, res: ServerResponse) {
    const parsed = loginDto.safeParse(reqBody);
    if (!parsed.success) {
      res.statusCode = 400;
      return { error: z.treeifyError(parsed.error) };
    }

    const tokens = await this.authService.login(parsed.data);
    this.setAuthCookies(res, tokens);
    return { message: "Logged in" };
  }

  async refresh(reqBody: unknown, res: ServerResponse) {
    const { refreshToken } = reqBody as { refreshToken?: string };
    if (!refreshToken) {
      res.statusCode = 401;
      return { error: "No refresh token" };
    }

    const tokens = await this.authService.refresh(refreshToken);
    this.setAuthCookies(res, tokens);
    return { message: "Token rotated" };
  }

  async logout(reqBody: unknown, res: ServerResponse) {
    const { refreshToken } = reqBody as { refreshToken?: string };
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.setHeader("Set-Cookie", [
      "accessToken=; HttpOnly; Path=/; Max-Age=0",
      "refreshToken=; HttpOnly; Path=/auth; Max-Age=0",
    ]);
    return { message: "Logged out" };
  }
}
