import { createServer } from "node:http";
import { AppModule } from "./app.module";
import { Core } from "./core/core.module";

async function bootstrap() {
	Core.Db.init();
	const db = Core.Db.get();
	await Core.Db.setup(db);
	await Core.Db.test();

	const server = createServer((req, res) => {
		for (const route of AppModule.routes) {
			if (req.method === route.method && req.url === route.path) {
				return route.handler(req, res);
			}
		}

		res.writeHead(404).end("Not Found");
	});

	server.listen(3000, () => Core.Logger.log("Server running on 3000"));
}

bootstrap().catch((err) => {
	console.error("Unexpected error occurred:", err);
});
