import { startMathServer } from "./math";
import { startWeatherServer } from "./weather";

async function main() {
  try {
    await startMathServer();
  } catch (error) {
    console.error("Error starting servers:", error);
  }
}

main().catch((error) => {
  process.exit(1);
});
