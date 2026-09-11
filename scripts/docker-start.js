// Launches Docker Desktop (if not already running) and waits until the
// engine responds, so scripts like bootstrap:dev can rely on Docker being
// ready without a manual "open Docker Desktop first" step.

import { spawn, execSync } from "node:child_process";

const DOCKER_DESKTOP_PATH =
  "C:\\Users\\Muizzz\\AppData\\Local\\Programs\\DockerDesktop\\Docker Desktop.exe";

const POLL_INTERVAL_MS = 2000;
const MAX_WAIT_MS = 120000;

const isEngineReady = () => {
  try {
    execSync("docker info", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  if (isEngineReady()) {
    console.log("Docker engine already running.");
    return;
  }

  console.log("Starting Docker Desktop...");
  spawn(DOCKER_DESKTOP_PATH, [], { detached: true, stdio: "ignore" }).unref();

  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS) {
    if (isEngineReady()) {
      console.log("Docker engine is ready.");
      return;
    }
    await wait(POLL_INTERVAL_MS);
  }

  console.error(`Docker engine did not become ready within ${MAX_WAIT_MS / 1000}s.`);
  process.exitCode = 1;
};

await main();
