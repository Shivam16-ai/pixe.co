import 'dotenv/config';
import cookieParser from 'cookie-parser';
import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

import { prisma } from './server/db.ts';
import { attachSocketServer } from './server/socket.ts';
import { extractUser } from './server/middleware/auth.ts';
import { adminRouter } from './server/routes/admin.routes.ts';
import { authRouter } from './server/routes/auth.routes.ts';
import { cartRouter } from './server/routes/cart.routes.ts';
import { orderRouter } from './server/routes/order.routes.ts';
import { productRouter } from './server/routes/product.routes.ts';
import { profileRouter } from './server/routes/profile.routes.ts';
import { searchRouter } from './server/routes/search.routes.ts';
import { uploadRouter } from './server/routes/upload.routes.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const app = express();
const httpServer = http.createServer(app);
const port = Number(process.env.PORT || 3000);
const normalizeOrigin = (value: string) => value.replace(/\/$/, '');
const allowedOrigins = new Set(
  [process.env.FRONTEND_URL, process.env.APP_URL, 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000']
    .filter((value): value is string => Boolean(value))
    .map(normalizeOrigin)
);

app.disable('x-powered-by');
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const requestOrigin = typeof req.headers.origin === 'string' ? normalizeOrigin(req.headers.origin) : null;
  const configuredOrigin = process.env.APP_URL ? normalizeOrigin(process.env.APP_URL) : null;

  if (requestOrigin && allowedOrigins.has(requestOrigin)) {
    res.header('Access-Control-Allow-Origin', req.headers.origin as string);
    res.header('Vary', 'Origin');
  } else if (configuredOrigin && (!requestOrigin || !allowedOrigins.has(requestOrigin))) {
    res.header('Access-Control-Allow-Origin', configuredOrigin);
    res.header('Vary', 'Origin');
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});

app.use(extractUser);

app.use('/api/auth', authRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/profile', profileRouter);
app.use('/api/admin', adminRouter);
app.use('/api/products', productRouter);
app.use('/api/search', searchRouter);
app.use('/api/upload', uploadRouter);

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, ok: true, database: 'sqlite', uptime: process.uptime() });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ success: false, message: 'Database not ready.' });
  }
});

if (!isProduction) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: __dirname,
  });

  app.use(vite.middlewares);

  app.use('*', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const indexPath = path.resolve(__dirname, 'index.html');
      const template = await fs.promises.readFile(indexPath, 'utf-8');
      const html = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).setHeader('Content-Type', 'text/html').end(html);
    } catch (error) {
      next(error);
    }
  });
} else {
  const distPath = path.resolve(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      return res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }
}

attachSocketServer(httpServer);

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', error);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

httpServer.listen(port, () => {
  console.log(`Pixé studio running at http://localhost:${port}`);
});
