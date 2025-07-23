import type { ServerResponse } from "node:http";
import { describe, expect, it, vi } from "vitest";
import type { AuthController } from "@/features/auth/auth.controller";
import { AuthRoutes } from "./auth.routes";

describe("AuthRoutes", () => {
  const mockController = {
    register: vi.fn(),
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
  } as unknown as AuthController;

  const routes = new AuthRoutes(mockController).routes;

  const mockReq = { body: { email: "test@example.com", password: "password123" } };
  const mockRes = { send: vi.fn(), status: vi.fn().mockReturnThis() } as Partial<ServerResponse> as ServerResponse;

  it("should define a POST /auth/register route with the correct handler", () => {
    const route = routes.find((r) => r.method === "POST" && r.path === "/auth/register");
    expect(route).toBeDefined();
    if (route) {
      route.handler(mockReq, mockRes);
      expect(mockController.register).toHaveBeenCalled();
    }
  });

  it("should define a POST /auth/login route with the correct handler", () => {
    const route = routes.find((r) => r.method === "POST" && r.path === "/auth/login");
    expect(route).toBeDefined();
    if (route) {
      route.handler(mockReq, mockRes);
      expect(mockController.login).toHaveBeenCalled();
    }
  });

  it("should define a POST /auth/refresh route with the correct handler", () => {
    const route = routes.find((r) => r.method === "POST" && r.path === "/auth/refresh");
    expect(route).toBeDefined();
    if (route) {
      route.handler(mockReq, mockRes);
      expect(mockController.refresh).toHaveBeenCalled();
    }
  });

  it("should define a POST /auth/logout route with the correct handler", () => {
    const route = routes.find((r) => r.method === "POST" && r.path === "/auth/logout");
    expect(route).toBeDefined();
    if (route) {
      route.handler(mockReq, mockRes);
      expect(mockController.logout).toHaveBeenCalled();
    }
  });
});
