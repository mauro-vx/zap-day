import * as Config from "./config/config.service";
import { Db } from "./db/db.module";
import * as Logger from "./logger/logger.service";

export const Core = {
	Config,
	Logger,
	Db,
};
