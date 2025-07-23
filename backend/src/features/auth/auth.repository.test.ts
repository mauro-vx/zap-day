import type { Kysely } from "kysely";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DB } from "@/core/db/db.types";
import { AuthRepository } from "./auth.repository";

const createMockDb = () => ({
  insertInto: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returningAll: vi.fn().mockReturnThis(),
  executeTakeFirstOrThrow: vi.fn(),
  selectFrom: vi.fn().mockReturnThis(),
  selectAll: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  executeTakeFirst: vi.fn(),
  updateTable: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  execute: vi.fn(),
});

describe("AuthRepository", () => {
  let mockDb: ReturnType<typeof createMockDb>;
  let authRepository: AuthRepository;

  beforeEach(() => {
    mockDb = createMockDb();
    authRepository = new AuthRepository(mockDb as unknown as Kysely<DB>);
  });

  describe("createUser", () => {
    it("should create a new user and return the created user", async () => {
      const userData = { email: "test@example.com", password_hash: "hashedpassword" };
      const mockUser = { id: 1, ...userData };
      mockDb.executeTakeFirstOrThrow.mockResolvedValue(mockUser);

      const result = await authRepository.createUser(userData);

      expect(mockDb.insertInto).toHaveBeenCalledWith("users");
      expect(mockDb.values).toHaveBeenCalledWith(userData);
      expect(mockDb.returningAll).toHaveBeenCalled();
      expect(mockDb.executeTakeFirstOrThrow).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe("findUserByEmail", () => {
    it("should find a user by email", async () => {
      const email = "test@example.com";
      const mockUser = { id: 1, email, password_hash: "hashedpassword" };
      mockDb.executeTakeFirst.mockResolvedValue(mockUser);

      const result = await authRepository.findUserByEmail(email);

      expect(mockDb.selectFrom).toHaveBeenCalledWith("users");
      expect(mockDb.selectAll).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalledWith("email", "=", email);
      expect(mockDb.executeTakeFirst).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe("saveRefreshToken", () => {
    it("should save a refresh token", async () => {
      const userId = 1;
      const token = "token";
      const expiresAt = new Date("2023-01-01");
      mockDb.execute.mockResolvedValue(undefined);

      const result = await authRepository.saveRefreshToken(userId, token, expiresAt);

      expect(mockDb.insertInto).toHaveBeenCalledWith("tokens");
      expect(mockDb.values).toHaveBeenCalledWith({
        user_id: userId,
        refresh_token: token,
        expires_at: expiresAt,
      });
      expect(mockDb.execute).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe("revokeToken", () => {
    it("should revoke a refresh token", async () => {
      const token = "token";
      mockDb.execute.mockResolvedValue(undefined);

      const result = await authRepository.revokeToken(token);

      expect(mockDb.updateTable).toHaveBeenCalledWith("tokens");
      expect(mockDb.set).toHaveBeenCalledWith({ revoked: true });
      expect(mockDb.where).toHaveBeenCalledWith("refresh_token", "=", token);
      expect(mockDb.execute).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe("findRefreshToken", () => {
    it("should find a refresh token if it is not revoked", async () => {
      const token = "token";
      const mockToken = { id: 1, refresh_token: token, revoked: false };
      mockDb.executeTakeFirst.mockResolvedValue(mockToken);

      const result = await authRepository.findRefreshToken(token);

      expect(mockDb.selectFrom).toHaveBeenCalledWith("tokens");
      expect(mockDb.selectAll).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalledWith("refresh_token", "=", token);
      expect(mockDb.where).toHaveBeenCalledWith("revoked", "=", false);
      expect(mockDb.executeTakeFirst).toHaveBeenCalled();
      expect(result).toEqual(mockToken);
    });
  });
});
