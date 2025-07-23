import type { Kysely } from "kysely";
import type { DB } from "@/core/db/db.types";
import { AuthRoutes } from "@/features/auth/auth.routes";
import { AuthController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";

/**
 * Creates the AuthModule dynamically with dependencies.
 */
export const authModule = (db: Kysely<DB>) => {
  const authRepository = new AuthRepository(db);
  const authService = new AuthService(authRepository);
  const authController = new AuthController(authService);
  const authRoutes = new AuthRoutes(authController);

  return authRoutes;
};
