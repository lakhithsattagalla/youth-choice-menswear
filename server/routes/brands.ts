import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', (req: AuthRequest, res: Response) => {
  const brands = db.data.brands.filter(b => b.status === 'ACTIVE').map(b => {
    const productCount = db.data.products.filter(p => p.brand_id === b.id && p.status === 'ACTIVE').length;
    return { ...b, product_count: productCount };
  });
  res.json({ brands });
});

router.post('/', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { name, logo, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Brand name required' });

  const id = `brand-${Date.now()}`;
  const now = new Date().toISOString();

  const newBrand = {
    id,
    name,
    logo: logo || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=80',
    description: description || '',
    status: 'ACTIVE' as const,
    created_at: now
  };

  db.data.brands.push(newBrand);
  db.save();
  res.status(201).json({ brand: newBrand });
});

router.put('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const index = db.data.brands.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ error: 'Brand not found' });

  const { name, logo, description, status } = req.body;
  db.data.brands[index] = {
    ...db.data.brands[index],
    name: name || db.data.brands[index].name,
    logo: logo || db.data.brands[index].logo,
    description: description !== undefined ? description : db.data.brands[index].description,
    status: status || db.data.brands[index].status
  };

  db.save();
  res.json({ brand: db.data.brands[index] });
});

router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  db.data.brands = db.data.brands.filter(b => b.id !== id);
  db.save();
  res.json({ message: 'Brand deleted' });
});

export default router;
