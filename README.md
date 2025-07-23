# 🌞 Daytime Planner Application

Daytime Planner is a full-stack solution for organizing daily activities. With features like task scheduling, weather updates, and sleep management, this app streamlines productivity and well-being. Built with TypeScript in a **monorepo structure**, it ensures consistent configurations and maintainability for both the frontend and backend.

---

## 📜 Table of Contents

1. ✨ [Features](#features)
2. 🛠️ [Tech Stack](#tech-stack)
  - 🎨 [Frontend](#frontend)
  - 🖧 [Backend](#backend)
3. 🗂️ [Monorepo Structure](#monorepo-structure)
4. 🧑‍💻 [Development Environment](#development-environment)
  - 🐳 [Using Docker](#using-docker)
  - 💻 [Running Locally](#running-locally)
5. ⚙️ [Environment Variables](#environment-variables)
6. 🧪 [Testing and Quality Assurance](#testing-and-quality-assurance)
7. 🤝 [Contributing](#contributing)
8. 📜 [License](#license)

---

## ✨ Features

- **Task Scheduling**: Manage your daily tasks seamlessly with an intuitive interface.
- **Weather Forecasts**: Access up-to-date weather conditions to align plans with the day.
- **Sleep Management**: Optimize sleeping habits with insightful recommendations.
- **Progressive Web App (PWA)**: Provides an installable, mobile-friendly, and offline-capable experience.
- Built with **TypeScript** for type safety and scalability.
- Fully **unit-tested** with comprehensive documentation.

---

## 🛠️ Tech Stack

### 🎨 Frontend

- **Framework**: [React](https://react.dev), optimized with [Vite](https://vitejs.dev).
- **Design System**: Built using the **shadcn/ui** component library.
- **Data Management**:
  - [@tanstack/react-query](https://tanstack.com/query/latest): Robust, TypeScript-safe state and remote data fetching.
  - [@tanstack/react-router](https://tanstack.com/router/latest): Modern TypeScript-first client-side routing.
- **Styling**: [Tailwind CSS](https://tailwindcss.com) for rapid, utility-first styling.
- **Architecture**: MVVM (Model-View-ViewModel) for clean separation of concerns.
- **Tooling**:
  - [Commitizen](https://commitizen-tools.github.io/commitizen/): Ensures semantic and consistent commit messages.
  - Configured as a **Progressive Web App (PWA)**.
- **Commands**:
  - Start the frontend in development mode:
    ```bash
    pnpm run dev
    ```

### 🖧 Backend

- **Environment**: Node.js, structured using clean architecture principles.
- **Database**: Powered by [PostgreSQL](https://postgresql.org) with [Kysely](https://koskimas.github.io/kysely/) for TypeScript-safe SQL queries.
- **TypeScript-first** development ensures reliability and maintainability.
- Fully **unit-tested** to handle business logic and API reliability.
- **Commands**:
  - Start the backend in development mode:
    ```bash
    pnpm run dev
    ```

---

## 🗂️ Monorepo Structure

This project employs a **monorepo** layout for managing the frontend, backend, and shared utilities under one repository.

### Key Benefits

- Centralized dependency management and consistent tooling.
- Shared TypeScript types to ensure compatibility between frontend and backend.

### Using `pnpm Workspaces`

Filtered commands allow you to run tasks for specific packages in the monorepo:
- To run a command in the backend context:
  ```bash
  pnpm --filter backend run <command>
  ```
- To run a command in the frontend context:
  ```bash
  pnpm --filter frontend run <command>
  ```

---

## 🧑‍💻 Development Environment

The application provides flexibility for development with options to run services locally or via Docker containers.

### 🐳 Using Docker

Docker handles containerized services for a seamless development environment. The services include:
- **Frontend container**
- **Backend container**
- **PostgreSQL database**

To launch the application in detached mode:
```bash
docker-compose up -d
```

To access the database container for logs or debugging:
```bash
docker exec -it <container_name> psql -U <username> -d <database_name>
```

### 💻 Running Locally

For running services without containers, follow these steps:
1. Start the PostgreSQL database server.
2. Launch the backend and frontend in development modes:
  - Backend:
    ```bash
    pnpm run dev
    ```
  - Frontend:
    ```bash
    pnpm run dev
    ```

---

## ⚙️ Environment Variables

The application uses environment variables to configure services like **PostgreSQL**. To set up your environment:

1. Create a `.env` file in the project root or backend directory.
2. Add the following variables with your own credentials and database settings:

```ini
# PostgreSQL Configuration
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=your_database_name
DB_HOST=localhost
DB_PORT=5432

# Full connection string (optional, overrides above values)
DATABASE_URL=postgres://your_username:your_secure_password@localhost:5432/your_database_name
```

💡 **Note**: When using Docker Compose, these variables are automatically injected into the PostgreSQL container during initialization. The specified database and user will be created on the first container startup—no manual setup needed.

---

## 🧪 Testing and Quality Assurance

This application includes rigorous testing to maintain quality:

- **Unit Tests**: Ensure business logic reliability.
- **E2E Tests**: Verify full application flows and integration between services.
- **Linting and Formatting**:
  - Run ESLint to check for code issues:
    ```bash
    pnpm run lint
    ```
  - Format code using Prettier:
    ```bash
    pnpm run format
    ```

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and ensure tests pass locally.
4. Submit a pull request with a detailed description of your changes.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE.md).
