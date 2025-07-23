import type { Kysely } from "kysely";
import { describe, expect, it, vi } from "vitest";
import type { DB } from "@/core/db/db.types";
import { AuthController } from "./auth.controller";
import { authModule } from "./auth.module";
import { AuthRepository } from "./auth.repository";
import { AuthRoutes } from "./auth.routes";
import { AuthService } from "./auth.service";

vi.mock("./auth.repository");
vi.mock("./auth.service");
vi.mock("./auth.controller");
vi.mock("./auth.routes");

describe("authModule", () => {
  it("should initialize and return an instance of AuthRoutes", () => {
    const mockDb = {} as unknown as Kysely<DB>;

    const result = authModule(mockDb);

    expect(AuthRepository).toHaveBeenCalledWith(mockDb);
    expect(AuthService).toHaveBeenCalledWith(expect.any(AuthRepository));
    expect(AuthController).toHaveBeenCalledWith(expect.any(AuthService));
    expect(AuthRoutes).toHaveBeenCalledWith(expect.any(AuthController));
    expect(result).toBeInstanceOf(AuthRoutes);
  });
});
