import http from "http";
import app from "./app";
import { initSocket } from "./socket/socket.server";

const PORT = process.env.PORT || 4001;

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(PORT, () => {
  console.log(`[API SERVER] Running at http://localhost:${PORT}`);
  console.log(`[SOCKET] WebSocket server initialized`);
});
