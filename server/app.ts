import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route';
import authRoutes from './routes/auth.route';
import rolePermissionRoutes from './routes/role-permission/role_permission.route';
import catalogRoutes from './routes/catalog.route';
import activityLogRoutes from './routes/activity-log.route';
import { createServer } from 'http';
import { errorHandler } from './middleware/error_handler.middleware';
import { AppDataSource } from './config/database';
import { Logger } from './utils/logger';
import { setupMiddleware } from './middleware';
import { initializeSocket } from './services/socket.service';
import { config } from './config';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const logger = new Logger({ level: 'info' });

setupMiddleware(app);
initializeSocket(httpServer);

app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/roles-permissions', rolePermissionRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/activities', activityLogRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = config.port;
httpServer.listen(PORT, async () => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connected');
    logger.info(`Server is running on port ${PORT}`);
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    process.exit(1);
  }
});

export default app;