/**
 * SETUVANA - Full-Stack Express Server & Dev Environment Runner
 * Mounts Vite Middlewares in Dev / Dist Static Serving in Prod on Port 3000
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { app } from './src/serverApp.ts';

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SETUVANA full-stack platform active on port ${PORT}`);
  });
}

startServer();
