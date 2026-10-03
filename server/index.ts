import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import brandRoutes from './routes/brands';
import cartRoutes from './routes/cart';
import wishlistRoutes from './routes/wishlist';
import orderRoutes from './routes/orders';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';
import analyticsRoutes from './routes/analytics';
import whatsappBotRoutes from './routes/whatsappBot';
import aiRoutes from './routes/ai';
import { db } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Initialize Database
db.init();

// Create master API Router to handle requests both with /api prefix and stripped /api prefix (Vercel serverless)
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/brands', brandRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/wishlist', wishlistRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/whatsapp', whatsappBotRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/user', userRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/analytics', analyticsRoutes);

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    store: 'Youth Choice Mens Wear',
    tagline: 'Define Your Style. Wear Your Confidence.',
    timestamp: new Date().toISOString()
  });
});

// Mount router for both /api/xxx and /xxx routes
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Serve frontend static files in production deployment
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Youth Choice Mens Wear Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

export default app;
export { app };
