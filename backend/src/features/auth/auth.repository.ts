import type { Kysely } from "kysely";
import type { DB } from "@/core/db/db.types";

/**
 * The AuthRepository class provides methods to handle authentication-related database operations.
 * This includes user management and operations with refresh tokens.
 */
export class AuthRepository {
  constructor(private readonly db: Kysely<DB>) {}

  async createUser(data: { email: string; password_hash: string }) {
    return await this.db.insertInto("users").values(data).returningAll().executeTakeFirstOrThrow();
  }

  async findUserByEmail(email: string) {
    return await this.db.selectFrom("users").selectAll().where("email", "=", email).executeTakeFirst();
  }

  async saveRefreshToken(userId: number, token: string, expiresAt: Date) {
    return await this.db
      .insertInto("tokens")
      .values({ user_id: userId, refresh_token: token, expires_at: expiresAt })
      .execute();
  }

  async revokeToken(refresh_token: string) {
    return await this.db
      .updateTable("tokens")
      .set({ revoked: true })
      .where("refresh_token", "=", refresh_token)
      .execute();
  }

  async findRefreshToken(refresh_token: string) {
    return await this.db
      .selectFrom("tokens")
      .selectAll()
      .where("refresh_token", "=", refresh_token)
      .where("revoked", "=", false)
      .executeTakeFirst();
  }
}
