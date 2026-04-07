import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./auth.service";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "http://localhost:7777";

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token: getAccessToken() },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function updateSocketAuth(token: string): void {
  if (socket) {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
  }
}
