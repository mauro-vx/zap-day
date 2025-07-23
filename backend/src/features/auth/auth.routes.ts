import type { Route } from "@/app.module";
import type { AuthController } from "@/features/auth/auth.controller";

/**
 * Factory function to create routes dynamically with injected dependencies.
 * Creates and returns a set of authentication routes for handling user authentication processes.
 *
 * These routes include:
 * - Registering a new user.
 * - Logging in an existing user.
 * - Refreshing access tokens.
 * - Logging out a user.
 *
 * @param db - The database instance used to create the authentication module.
 * @returns An array of route definitions for authentication endpoints, where each route definition contains the HTTP method, the path, and the corresponding request handler.
 */
export class AuthRoutes {
  public readonly routes: Route[];

  constructor(private readonly controller: AuthController) {
    this.routes = [
      { method: "POST", path: "/auth/register", handler: this.controller.register.bind(this.controller) },
      { method: "POST", path: "/auth/login", handler: this.controller.login.bind(this.controller) },
      { method: "POST", path: "/auth/refresh", handler: this.controller.refresh.bind(this.controller) },
      { method: "POST", path: "/auth/logout", handler: this.controller.logout.bind(this.controller) },
    ];
  }
}
