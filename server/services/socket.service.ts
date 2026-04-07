import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { TokenService } from "./token.service";
import { config } from "../config";

const tokenService = new TokenService();

let io: Server | null = null;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigins,
      credentials: true,
    },
  });

  io.use(authenticateSocket);
  io.on("connection", handleConnection);

  return io;
}

function authenticateSocket(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const payload = tokenService.verifyAccessToken(token);
    socket.data.userId = payload.id;
    socket.data.email = payload.email;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
}

function handleConnection(socket: Socket) {
  const userId = socket.data.userId;
  socket.join(`user:${userId}`);

  socket.on("disconnect", () => {
    socket.leave(`user:${userId}`);
  });
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.IO not initialized. Call initializeSocket first.");
  }
  return io;
}

export function emitToUser(userId: string, event: string, data: any): void {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export function emitToAll(event: string, data: any): void {
  if (io) {
    io.emit(event, data);
  }
}
