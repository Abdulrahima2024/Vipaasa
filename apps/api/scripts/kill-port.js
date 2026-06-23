const { execSync } = require("child_process");
const port = 4000;

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
