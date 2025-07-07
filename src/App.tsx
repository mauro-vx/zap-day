import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import viteLogo from "/vite.svg";
import reactLogo from "./assets/react.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="container mx-auto flex flex-col items-center justify-center h-screen">
      <div className="flex justify-center items-center space-x-6 py-6">
        <a
          href="https://vite.dev"
          target="_blank"
          rel="noopener"
          className="transition hover:drop-shadow-[0_0_2em_#646cffaa]"
        >
          <img
            src={viteLogo}
            alt="Vite logo"
            className="h-24 p-6 will-change-[filter]"
          />
        </a>

        <a
          href="https://react.dev"
          target="_blank"
          rel="noopener"
          className="transition hover:drop-shadow-[0_0_2em_#646cffaa] spin-slow"
        >
          <img
            src={reactLogo}
            alt="React logo"
            className="h-24 p-6 will-change-[filter]"
          />
        </a>
      </div>

      <h1 className="font-bold text-xl my-4">Vite + React</h1>

      <div className="flex flex-col items-center space-y-4">
        <Button
          variant="outline"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </Button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <p className="text-gray-600">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
