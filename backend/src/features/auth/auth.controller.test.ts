import type { ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthService } from "@/features/auth/auth.service";
import { AuthController } from "./auth.controller";

describe("AuthController", () => {
  const mockAuthService = {
    register: vi.fn(),
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
  };

  const authController = new AuthController(mockAuthService as unknown as AuthService);

  const mockResponse = (): ServerResponse => {
    const res: Partial<ServerResponse> = {
      setHeader: vi.fn(),
    };
    return res as ServerResponse;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user and return a 201 status", async () => {
      mockAuthService.register.mockResolvedValue({ id: 1, email: "test@example.com" });
      const reqBody = { email: "test@example.com", password: "password123" };
      const mockRes = mockResponse();

      const result = await authController.register(reqBody, mockRes);

      expect(mockAuthService.register).toHaveBeenCalledWith(reqBody);
      expect(result).toEqual({ user: { id: 1, email: "test@example.com" } });
      expect(mockRes.statusCode).toBe(201);
    });

    it("should return 400 if the registration data is invalid", async () => {
      const reqBody = { email: "test@example.com" };
      const mockRes = mockResponse();

      const result = await authController.register(reqBody, mockRes);

      expect(result.error).toBeDefined();
      expect(mockRes.statusCode).toBe(400);
    });
  });

  describe("login", () => {
    it("should log in a user and set auth cookies", async () => {
      const tokens = { accessToken: "access", refreshToken: "refresh" };
      mockAuthService.login.mockResolvedValue(tokens);
      const reqBody = { email: "test@example.com", password: "password123" };
      const mockRes = mockResponse();

      const result = await authController.login(reqBody, mockRes);

      expect(mockAuthService.login).toHaveBeenCalledWith(reqBody);
      expect(result).toEqual({ message: "Logged in" });
      expect(mockRes.setHeader).toHaveBeenCalledWith("Set-Cookie", expect.any(Array));
    });

    it("should return 400 if login data is invalid", async () => {
      const reqBody = { email: "test@example.com" };
      const mockRes = mockResponse();

      const result = await authController.login(reqBody, mockRes);

      expect(result.error).toBeDefined();
      expect(mockRes.statusCode).toBe(400);
    });
  });

  describe("refresh", () => {
    it("should refresh tokens and set new cookies", async () => {
      const tokens = { accessToken: "newAccess", refreshToken: "newRefresh" };
      mockAuthService.refresh.mockResolvedValue(tokens);
      const reqBody = { refreshToken: "oldRefresh" };
      const mockRes = mockResponse();

      const result = await authController.refresh(reqBody, mockRes);

      expect(mockAuthService.refresh).toHaveBeenCalledWith("oldRefresh");
      expect(result).toEqual({ message: "Token rotated" });
      expect(mockRes.setHeader).toHaveBeenCalledWith("Set-Cookie", expect.any(Array));
    });

    it("should return 401 if refresh token is missing", async () => {
      const reqBody = {};
      const mockRes = mockResponse();

      const result = await authController.refresh(reqBody, mockRes);

      expect(result.error).toBe("No refresh token");
      expect(mockRes.statusCode).toBe(401);
    });
  });

  describe("logout", () => {
    it("should call authService.logout and clear cookies if refresh token is provided", async () => {
      const reqBody = { refreshToken: "test-refresh-token" };
      const mockRes = mockResponse();

      await authController.logout(reqBody, mockRes);

      expect(mockAuthService.logout).toHaveBeenCalledWith("test-refresh-token");
      expect(mockRes.setHeader).toHaveBeenCalledWith("Set-Cookie", expect.any(Array));
    });

    it("should clear cookies even if refresh token is not provided", async () => {
      const reqBody = {};
      const mockRes = mockResponse();

      await authController.logout(reqBody, mockRes);

      expect(mockAuthService.logout).not.toHaveBeenCalled();
      expect(mockRes.setHeader).toHaveBeenCalledWith("Set-Cookie", expect.any(Array));
    });
  });
});
