const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Default ports used in the monorepo
const DEFAULT_PORTS = [3000, 3001, 4000, 4001, 4002];

// Helper to extract port from .env file
function getPortFromEnv(envPath) {
  try {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/^PORT\s*=\s*(\d+)/m);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
  } catch (e) {
    // Ignore
  }
  return null;
}

// Helper to extract ports from app config/env
function getConfiguredPorts() {
  const ports = new Set(DEFAULT_PORTS);
  
  // Try to find ports from env files
  const rootDir = path.resolve(__dirname, "..", "..");
  const apiEnv = path.join(rootDir, "api", ".env");
  const webEnv = path.join(rootDir, "web", ".env");
  const adminEnv = path.join(rootDir, "admin", ".env");

  const apiPort = getPortFromEnv(apiEnv);
  if (apiPort) ports.add(apiPort);

  const webPort = getPortFromEnv(webEnv);
  if (webPort) ports.add(webPort);

  const adminPort = getPortFromEnv(adminEnv);
  if (adminPort) ports.add(adminPort);

  return Array.from(ports);
}

// Get ports to kill from command line args, or use auto-detected ones
let portsToKill = process.argv.slice(2).map(p => parseInt(p, 10)).filter(p => !isNaN(p));
if (portsToKill.length === 0) {
  portsToKill = getConfiguredPorts();
}

console.log(`[kill-port] Checking ports: ${portsToKill.join(", ")}`);

for (const port of portsToKill) {
  try {
    if (process.platform === "win32") {
      const stdout = execSync("netstat -ano").toString();
      const lines = stdout.split("\r\n").map((l) => l.trim());
      const pids = new Set();
      for (const line of lines) {
        if (line.includes(`:${port}`) || line.includes(`0.0.0.0:${port}`) || line.includes(`[::]:${port}`)) {
          const parts = line.split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(Number(pid)) && pid !== "0") {
            pids.add(pid);
          }
        }
      }
      for (const pid of pids) {
        console.log(`[kill-port] Killing process ${pid} on port ${port}...`);
        try {
          execSync(`taskkill /F /PID ${pid}`);
        } catch (err) {
          // ignore
        }
      }
    } else {
      // Unix/macOS
      try {
        execSync(`lsof -t -i:${port} | xargs kill -9`);
        console.log(`[kill-port] Killed process on port ${port}`);
      } catch (e) {
        // ignore
      }
    }
  } catch (error) {
    // Ignore errors
  }
}
