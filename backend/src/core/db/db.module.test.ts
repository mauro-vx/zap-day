import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { SchemaSetup } from "@/core/db/db.schema-setup";
import { getDb, initDb, testConnection } from "@/core/db/db.service";
import { DbModule } from "./db.module";

vi.mock("@/core/db/db.service", () => ({
  initDb: vi.fn(),
  getDb: vi.fn(),
  testConnection: vi.fn(),
}));

vi.mock("@/core/db/db.schema-setup", () => {
  const runMock = vi.fn();
  const SchemaSetupMock = vi.fn().mockImplementation(() => ({ run: runMock }));

  SchemaSetupMock.prototype.run = runMock;

  return { SchemaSetup: SchemaSetupMock };
});

describe("DB module init", () => {
  const mockDbInstance = {};
  let dbModule: DbModule;

  beforeEach(() => {
    vi.clearAllMocks();
    dbModule = new DbModule();

    (getDb as Mock).mockImplementation(() => mockDbInstance);
  });

  it("should initialize the database connection properly", async () => {
    await dbModule.init();

    expect(initDb).toHaveBeenCalledOnce();
    expect(getDb).toHaveBeenCalledOnce();
    expect(testConnection).toHaveBeenCalledOnce();
    expect(SchemaSetup).toHaveBeenCalledWith(mockDbInstance);
    expect(SchemaSetup.prototype.run).toHaveBeenCalledOnce();
  });

  it("should throw an error when testConnection fails", async () => {
    (testConnection as Mock).mockRejectedValue(new Error("Connection failed"));

    await expect(dbModule.init()).rejects.toThrow("Connection failed");

    expect(initDb).toHaveBeenCalledOnce();
    expect(getDb).toHaveBeenCalledOnce();
    expect(testConnection).toHaveBeenCalledOnce();
    expect(SchemaSetup).not.toHaveBeenCalled();
  });

  it("should throw an error when schema setup fails", async () => {
    (testConnection as Mock).mockResolvedValue(true);
    (SchemaSetup.prototype.run as Mock).mockRejectedValue(new Error("Schema setup failed"));

    await expect(dbModule.init()).rejects.toThrow("Schema setup failed");

    expect(initDb).toHaveBeenCalledOnce();
    expect(getDb).toHaveBeenCalledOnce();
    expect(testConnection).toHaveBeenCalledOnce();
    expect(SchemaSetup).toHaveBeenCalledWith(mockDbInstance);
  });
});
