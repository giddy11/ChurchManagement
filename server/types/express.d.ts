declare global {
  namespace Express {
    interface Request {
      validated: {
        body?: Record<string, unknown>;
        query?: Record<string, unknown>;
        params?: Record<string, unknown>;
      };
    }
  }
}

export {};
