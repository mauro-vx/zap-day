import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { LoginDto, RegisterDto } from "./auth.dto";
import type { AuthRepository } from "./auth.repository";

/**
 * A constant that defines the default secret key used for access authentication.
 */
const DEFAULT_ACCESS_SECRET = process.env.ACCESS_SECRET ?? "access-secret";
/**
 * DEFAULT_REFRESH_SECRET is utilized to ensure the integrity and authenticity of
 * refresh tokens in secure authentication processes.
 */
const DEFAULT_REFRESH_SECRET = process.env.REFRESH_SECRET ?? "refresh-secret";

/**
 * The AuthService class is responsible for handling user authentication,
 * including user registration, login, token generation, token refreshing,
 * and logging out by revoking refresh tokens.
 */
export class AuthService {
  private readonly ACCESS_SECRET: string;
  private readonly REFRESH_SECRET: string;

  constructor(
    private readonly authRepository: AuthRepository,
    env = process.env,
  ) {
    this.ACCESS_SECRET = env.ACCESS_SECRET ?? DEFAULT_ACCESS_SECRET;
    this.REFRESH_SECRET = env.REFRESH_SECRET ?? DEFAULT_REFRESH_SECRET;
  }

  private async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  private async verifyPassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  private generateAccessToken(payload: object): string {
    return jwt.sign(payload, this.ACCESS_SECRET, { expiresIn: "15m" });
  }

  private generateRefreshToken(payload: object): string {
    return jwt.sign(payload, this.REFRESH_SECRET, { expiresIn: "7d" });
  }

  private verifyRefreshToken(token: string) {
    try {
      return jwt.verify(token, this.REFRESH_SECRET) as jwt.JwtPayload & {
        userId: number;
        email: string;
      };
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new Error("Refresh token has expired");
      } else if (err instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid refresh token");
      } else {
        throw new Error("Error verifying refresh token");
      }
    }
  }

  async register(data: RegisterDto) {
    const hashed = await this.hashPassword(data.password);

    const user = await this.authRepository.createUser({
      email: data.email,
      password_hash: hashed,
    });

    return { id: user.id, email: user.email };
  }

  async login(data: LoginDto) {
    const user = await this.authRepository.findUserByEmail(data.email);
    if (!user) throw new Error("Invalid credentials");

    const match = await this.verifyPassword(data.password, user.password_hash);
    if (!match) throw new Error("Invalid credentials");

    const payload = { userId: user.id, email: user.email };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    const decoded = jwt.decode(refreshToken) as { exp: number };
    await this.authRepository.saveRefreshToken(user.id, refreshToken, new Date(decoded.exp * 1000));

    return { accessToken, refreshToken };
  }

  async refresh(oldRefreshToken: string) {
    const dbToken = await this.authRepository.findRefreshToken(oldRefreshToken);
    if (!dbToken) throw new Error("Refresh token not found or revoked");

    const { userId, email } = this.verifyRefreshToken(oldRefreshToken);

    await this.authRepository.revokeToken(oldRefreshToken);

    const payload = { userId, email };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    const decoded = jwt.decode(refreshToken) as { exp: number };

    await this.authRepository.saveRefreshToken(userId, refreshToken, new Date(decoded.exp * 1000));

    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string) {
    await this.authRepository.revokeToken(refreshToken);
  }
}
