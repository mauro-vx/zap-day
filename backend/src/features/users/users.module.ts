export const UsersModule = {
	routes: [
		/**
		 * GET /users - Returns a list of mock users
		 */
		{
			method: "GET",
			path: "/users",
			handler: (req: any, res: any) => {
				const mockUsers = [
					{ id: 1, name: "John Doe", email: "john@example.com" },
					{ id: 2, name: "Jane Doe", email: "jane@example.com" },
				];

				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(JSON.stringify(mockUsers));
			},
		},

		/**
		 * GET /users/:id - Returns a single mock user by ID
		 */
		{
			method: "GET",
			path: "/users/:id",
			handler: (req: any, res: any) => {
				// Extract user ID from the request URL
				const userId = parseInt(req.url.split("/").pop() || "", 10);

				// Simulate a mock user
				const user = {
					id: userId,
					name: `User ${userId}`,
					email: `user${userId}@example.com`,
				};

				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(JSON.stringify(user));
			},
		},
	],
};
