import { Router, Response } from 'express';
import { db } from '../db.js';
import { optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/track', optionalAuth, (req: AuthRequest, res: Response) => {
  const { event_type, product_id, category_id, brand_id, metadata } = req.body;

  if (!event_type) return res.status(400).json({ error: 'event_type required' });

  db.data.analytics_events.push({
    id: `evt-${Date.now()}`,
    event_type,
    user_id: req.user?.id,
    product_id: product_id || undefined,
    category_id: category_id || undefined,
    brand_id: brand_id || undefined,
    metadata: metadata ? JSON.stringify(metadata) : undefined,
    created_at: new Date().toISOString()
  });

  db.save();
  res.json({ status: 'tracked' });
});

export default router;
