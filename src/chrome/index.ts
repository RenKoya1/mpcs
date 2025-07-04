import { spawn, ChildProcess } from "child_process";

export async function startChromeServerHTTP(port: number = 12306) {
  return new Promise<void>((resolve, reject) => {
    console.error(`Starting Chrome MCP Server on HTTP port ${port}...`);

    const serverPath =
      "./chrome/mcp-chrome-0.0.5/app/native-server/dist/mcp/mcp-server-stdio.js";

    const serverProcess: ChildProcess = spawn("node", [serverPath], {
      stdio: ["inherit", "inherit", "pipe"],
      env: {
        ...process.env,
        PORT: port.toString(),
      },
    });

    serverProcess.stderr?.on("data", (data: Buffer) => {
      const message = data.toString().trim();
      console.error(`[Chrome Server] ${message}`);

      if (
        message.includes(`Server listening on port ${port}`) ||
        message.includes("Server started") ||
        message.includes("listening")
      ) {
        console.error(
          `✅ Chrome MCP Server is running on http://localhost:${port}!`
        );
        resolve();
      }
    });

    serverProcess.on("error", (error: Error) => {
      console.error(`Chrome server error: ${error.message}`);
      reject(error);
    });

    serverProcess.on("close", (code: number | null) => {
      if (code !== 0) {
        reject(new Error(`Chrome server exited with code ${code}`));
      }
    });

    setTimeout(() => {
      console.error(
        `✅ Chrome MCP Server assumed running on http://localhost:${port}`
      );
      resolve();
    }, 3000);
  });
}

export async function startChromeServer() {
  return new Promise<void>((resolve, reject) => {
    console.error("Starting Chrome MCP Server...");

    const serverPath =
      "./chrome/mcp-chrome-0.0.5/app/native-server/dist/mcp/mcp-server-stdio.js";

    const serverProcess: ChildProcess = spawn("node", [serverPath], {
      stdio: ["inherit", "inherit", "pipe"],
    });

    serverProcess.stderr?.on("data", (data: Buffer) => {
      const message = data.toString().trim();
      if (message.includes("Chrome MCP Server running")) {
        console.error("✅ Chrome MCP Server is running!");
        resolve();
      } else {
        console.error(`[Chrome Server] ${message}`);
      }
    });

    serverProcess.on("error", (error: Error) => {
      console.error(`Chrome server error: ${error.message}`);
      reject(error);
    });

    serverProcess.on("close", (code: number | null) => {
      if (code !== 0) {
        reject(new Error(`Chrome server exited with code ${code}`));
      }
    });
  });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const port = args.length > 0 ? parseInt(args[0]) : 12306;

  if (args.includes("--http")) {
    startChromeServerHTTP(port).catch((error) => {
      console.error("Failed to start Chrome HTTP server:", error);
      process.exit(1);
    });
  } else {
    startChromeServer().catch((error) => {
      console.error("Failed to start Chrome server:", error);
      process.exit(1);
    });
  }
}
