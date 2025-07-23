import type { Kysely } from "kysely";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DB } from "@/core/db/db.types";
import { SchemaSetup } from "./db.schema-setup";

describe("DB schema setup", async () => {
  const mockDb = {
    schema: {
      createTable: vi.fn().mockReturnThis(),
      ifNotExists: vi.fn().mockReturnThis(),
      addColumn: vi.fn().mockReturnThis(),
      execute: vi.fn(),
    },
  } as unknown as Kysely<DB>;

  let schemaSetup: SchemaSetup;

  beforeEach(() => {
    vi.clearAllMocks();
    schemaSetup = new SchemaSetup(mockDb);
  });

  it("should call all table creation methods in sequence", async () => {
    const createUsersTableSpy = vi.spyOn(schemaSetup, "createUsersTable").mockResolvedValue(undefined);
    const createTokensTableSpy = vi.spyOn(schemaSetup, "createTokensTable").mockResolvedValue(undefined);
    const createHabitsTableSpy = vi.spyOn(schemaSetup, "createHabitsTable").mockResolvedValue(undefined);
    const createHabitsLogTableSpy = vi.spyOn(schemaSetup, "createHabitsLogTable").mockResolvedValue(undefined);
    const createUserProfileTableSpy = vi.spyOn(schemaSetup, "createUserProfileTable").mockResolvedValue(undefined);
    const createHabitsTagTableSpy = vi.spyOn(schemaSetup, "createHabitsTagTable").mockResolvedValue(undefined);
    const createRemindersTableSpy = vi.spyOn(schemaSetup, "createRemindersTable").mockResolvedValue(undefined);

    await schemaSetup.run();

    expect(createUsersTableSpy).toHaveBeenCalledTimes(1);
    expect(createTokensTableSpy).toHaveBeenCalledTimes(1);
    expect(createHabitsTableSpy).toHaveBeenCalledTimes(1);
    expect(createHabitsLogTableSpy).toHaveBeenCalledTimes(1);
    expect(createUserProfileTableSpy).toHaveBeenCalledTimes(1);
    expect(createHabitsTagTableSpy).toHaveBeenCalledTimes(1);
    expect(createRemindersTableSpy).toHaveBeenCalledTimes(1);

    const callOrder = [
      createUsersTableSpy,
      createTokensTableSpy,
      createHabitsTableSpy,
      createHabitsLogTableSpy,
      createUserProfileTableSpy,
      createHabitsTagTableSpy,
      createRemindersTableSpy,
    ];
    for (let i = 0; i < callOrder.length - 1; i++) {
      expect(callOrder[i]).toHaveBeenCalledBefore(callOrder[i + 1]);
    }
  });
});
