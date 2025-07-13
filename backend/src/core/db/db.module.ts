import { getDb, initDb, testConnection } from "./db.service";
import { setupSchema } from "./db.setup-schema";

export const Db = {
	init: initDb,
	get: getDb,
	test: testConnection,
	setup: setupSchema,
};
