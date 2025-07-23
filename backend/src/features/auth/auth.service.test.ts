import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LoginDto, RegisterDto } from "./auth.dto";
import type { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";

vi.mock("bcrypt");
vi.mock("jsonwebtoken");

describe("AuthService", () => {
  let authService: AuthService;
  let mockRepo: AuthRepository;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockRepo = {
      createUser: vi.fn(),
      findUserByEmail: vi.fn(),
      saveRefreshToken: vi.fn(),
      findRefreshToken: vi.fn(),
      revokeToken: vi.fn(),
    } as unknown as AuthRepository;

    authService = new AuthService(mockRepo, {
      ACCESS_SECRET: "access-secret",
      REFRESH_SECRET: "refresh-secret",
    });
  });

  describe("register()", () => {
    it("hashes password, calls createUser and returns minimal user info", async () => {
      const dto: RegisterDto = { email: "x@x.com", password: "p@ssword" };
      const hashed = "hashed_pw";
      const created = {
        id: 99,
        email: dto.email,
        password_hash: hashed,
        created_at: new Date(),
      };

      vi.spyOn(bcrypt, "hash").mockImplementation(async () => hashed);
      vi.spyOn(mockRepo, "createUser").mockResolvedValueOnce(created);

      const result = await authService.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockRepo.createUser).toHaveBeenCalledWith({
        email: dto.email,
        password_hash: hashed,
      });
      expect(result).toEqual({ id: created.id, email: created.email });
    });
  });

  describe("login()", () => {
    const dto: LoginDto = { email: "y@y.com", password: "1234" };
    const user = { id: 5, email: dto.email, password_hash: "h_pw", created_at: new Date() };

    it("throws on missing user", async () => {
      vi.spyOn(mockRepo, "findUserByEmail").mockResolvedValueOnce(undefined);

      await expect(authService.login(dto)).rejects.toThrow("Invalid credentials");
    });

    it("throws on bad password", async () => {
      vi.spyOn(mockRepo, "findUserByEmail").mockResolvedValueOnce(user);
      vi.spyOn(bcrypt, "compare").mockImplementation(async () => false);

      await expect(authService.login(dto)).rejects.toThrow("Invalid credentials");
    });

    it("generates tokens, saves refresh token, and returns them", async () => {
      const accessToken = "access-token";
      const refreshToken = "refresh-token";
      const decoded = { exp: 1_650_000_000 };

      vi.spyOn(mockRepo, "findUserByEmail").mockResolvedValueOnce(user);
      vi.spyOn(bcrypt, "compare").mockImplementation(async () => true);
      const signSpy = vi.spyOn(jwt, "sign");
      signSpy.mockImplementationOnce(() => accessToken);
      signSpy.mockImplementationOnce(() => refreshToken);
      vi.spyOn(jwt, "decode").mockReturnValueOnce(decoded);
      vi.spyOn(mockRepo, "saveRefreshToken").mockResolvedValueOnce([{ insertId: 1n, numInsertedOrUpdatedRows: 1n }]);

      const result = await authService.login(dto);

      expect(mockRepo.findUserByEmail).toHaveBeenCalledWith(dto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, user.password_hash);
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(jwt.decode).toHaveBeenCalledWith(refreshToken);
      expect(mockRepo.saveRefreshToken).toHaveBeenCalledWith(user.id, refreshToken, new Date(decoded.exp * 1000));
      expect(result).toEqual({ accessToken, refreshToken });
    });
  });

  describe("refresh()", () => {
    const oldToken = "old-refresh-token";
    const dbRow = {
      id: 1,
      expires_at: new Date(),
      issued_at: new Date(),
      refresh_token: oldToken,
      revoked: false,
      user_id: 10,
    };
    const payload = { userId: 10, email: "z@z.com" };

    it("throws if token not found", async () => {
      vi.spyOn(mockRepo, "findRefreshToken").mockResolvedValueOnce(undefined);

      await expect(authService.refresh(oldToken)).rejects.toThrow("Refresh token not found or revoked");
    });

    it("verifies, revokes old, saves new and returns rotated tokens", async () => {
      const newAccess = "new-access-token";
      const newRefresh = "new-refresh-token";
      const decodedNew = { exp: 1_660_000_000 };

      vi.spyOn(mockRepo, "findRefreshToken").mockResolvedValueOnce(dbRow);
      vi.spyOn(jwt, "verify").mockImplementation(() => payload);
      const signSpy = vi.spyOn(jwt, "sign");
      signSpy.mockImplementationOnce(() => newAccess);
      signSpy.mockImplementationOnce(() => newRefresh);
      vi.spyOn(jwt, "decode").mockReturnValueOnce(decodedNew);
      vi.spyOn(mockRepo, "revokeToken").mockResolvedValueOnce([{ numChangedRows: 1n, numUpdatedRows: 1n }]);
      vi.spyOn(mockRepo, "saveRefreshToken").mockResolvedValueOnce([{ insertId: 1n, numInsertedOrUpdatedRows: 1n }]);

      const result = await authService.refresh(oldToken);

      expect(mockRepo.findRefreshToken).toHaveBeenCalledWith(oldToken);
      expect(jwt.verify).toHaveBeenCalledWith(oldToken, "refresh-secret");
      expect(mockRepo.revokeToken).toHaveBeenCalledWith(oldToken);
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(mockRepo.saveRefreshToken).toHaveBeenCalledWith(
        payload.userId,
        newRefresh,
        new Date(decodedNew.exp * 1000),
      );
      expect(result).toEqual({ accessToken: newAccess, refreshToken: newRefresh });
    });
  });

  describe("logout()", () => {
    it("revokes the given refresh token", async () => {
      const token = "some-token";
      vi.spyOn(mockRepo, "revokeToken").mockResolvedValueOnce([{ numChangedRows: 1n, numUpdatedRows: 1n }]);

      await authService.logout(token);

      expect(mockRepo.revokeToken).toHaveBeenCalledWith(token);
    });
  });
});
