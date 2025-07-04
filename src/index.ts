import { startChromeServer, startChromeServerHTTP } from "./chrome";
import { startMathServer } from "./math";
import { startWeatherServer } from "./weather";

const isHttpMode = true;

async function main() {
  try {
    if (isHttpMode) {
      const port = 12306;
      console.log(`Starting Chrome MCP Server on HTTP port ${port}...`);
      await startChromeServerHTTP(port);
    } else {
      // await startMathServer();
      // await startWeatherServer()
      await startChromeServer();
    }
  } catch (error) {
    console.error("Error starting servers:", error);
  }
}

main().catch((error) => {
  process.exit(1);
});
