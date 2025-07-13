import { UsersModule } from "./features/users/users.module";

export const AppModule = {
	routes: [...UsersModule.routes],
};
