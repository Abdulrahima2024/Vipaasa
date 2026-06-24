import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4002";

let socket: Socket | null = null;
let lastToken: string | null = null;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

/**
 * Get or create a Socket.IO connection.
 * Prevents duplicate connections by reusing the singleton.
 */
export function getSocket(): Socket {
  const token = typeof window !== "undefined" ? localStorage.getItem("vipaasa_admin_token") : null;

  if (socket && token === lastToken) {
    return socket;
  }

  // If token changed or socket exists but disconnected, clean up first
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  lastToken = token;

  socket = io(API_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    autoConnect: true,
  });

  socket.on("connect", () => {
    connectionAttempts = 0;
    console.log("[SOCKET] Connected to server:", socket?.id);
  });

  socket.on("connect_error", (err: Error) => {
    connectionAttempts++;
    console.warn(`[SOCKET] Connection error (attempt ${connectionAttempts}):`, err.message);
    if (connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error("[SOCKET] Max reconnection attempts reached. Giving up.");
      socket?.disconnect();
    }
  });

  socket.on("disconnect", (reason: string) => {
    console.log("[SOCKET] Disconnected:", reason);
    if (reason === "io server disconnect") {
      // Server initiated disconnect, reconnect manually
      setTimeout(() => socket?.connect(), 1000);
    }
  });

  return socket;
}

/**
 * Disconnect and clean up the socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    connectionAttempts = 0;
  }
}

/**
 * Check if the socket is currently connected
 */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}
