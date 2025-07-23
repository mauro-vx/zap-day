import type { DB } from "kysely-codegen";
import type { Pool } from "pg";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface GlobalWithPool {
  getPool?: () => Pool;
}

let mockDb: { destroy: () => Promise<void> } | null = null;

const mockKyselyInstance = {
  destroy: vi.fn(async () => {
    mockDb = null;
  }),
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockPostgresDialect = vi.fn();
const mockKyselyConstructor = vi.fn(({ dialect }) => {
  return { ...mockKyselyInstance, dialect };
});

vi.mock("kysely", () => ({
  Kysely: mockKyselyConstructor,
  PostgresDialect: mockPostgresDialect,
}));

vi.mock("pg", () => ({
  Pool: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    end: vi.fn(),
  })),
}));

vi.mock("./db.service", () => {
  return {
    initDb: (customPool?: Pool) => {
      if (mockDb) return;
      const pool = customPool ?? (global as GlobalWithPool).getPool?.();
      const dialect = new mockPostgresDialect({ pool });
      mockDb = new mockKyselyConstructor({ dialect }) as unknown as Kysely<DB>;
    },
    getDb: () => {
      if (!mockDb) throw new Error("❌ DB not initialized. Call initDb() first.");
      return mockDb;
    },
    closeDb: async () => {
      if (mockDb) {
        await mockDb.destroy();
        mockDb = null;
      }
    },
  };
});

import type { Kysely } from "kysely";
import { closeDb, getDb, initDb } from "./db.service";

const resetMocks = () => {
  vi.clearAllMocks();
  mockDb = null;
};

describe("DB service", () => {
  beforeEach(resetMocks);
  afterEach(resetMocks);

  describe("initDb", () => {
    it("should initialize the database with a custom pool", () => {
      const mockPool = { connect: vi.fn() } as unknown as Pool;
      initDb(mockPool);

      expect(mockPostgresDialect).toHaveBeenCalledWith({ pool: mockPool });
      expect(mockKyselyConstructor).toHaveBeenCalledWith({
        dialect: expect.anything(),
      });
    });

    it("should initialize the database with the default pool if no custom pool is provided", () => {
      const mockGetPool = vi.fn(() => ({ connect: vi.fn() }) as unknown as Pool);
      const originalGetPool = (global as GlobalWithPool).getPool;
      (global as GlobalWithPool).getPool = mockGetPool;

      initDb();

      expect(mockGetPool).toHaveBeenCalled();
      expect(mockPostgresDialect).toHaveBeenCalledWith({
        pool: expect.anything(),
      });
      expect(mockKyselyConstructor).toHaveBeenCalledWith({
        dialect: expect.anything(),
      });

      (global as GlobalWithPool).getPool = originalGetPool;
    });

    it("should not reinitialize the database if already initialized", () => {
      initDb();
      initDb();

      expect(mockPostgresDialect).toHaveBeenCalledTimes(1);
      expect(mockKyselyConstructor).toHaveBeenCalledTimes(1);
    });
  });

  describe("getDb", () => {
    it("should return the database instance when initialized", () => {
      initDb();
      expect(getDb()).toBeDefined();
    });

    it("should throw an error if the database has not been initialized", () => {
      expect(() => getDb()).toThrowError("❌ DB not initialized. Call initDb() first.");
    });
  });

  describe("closeDb", () => {
    it("should close the database connection if db exists", async () => {
      initDb();
      await closeDb();
      expect(mockDb).toBeNull();
    });

    it("should do nothing if db is not initialized", async () => {
      await closeDb();
      expect(mockDb).toBeNull();
    });
  });
});
