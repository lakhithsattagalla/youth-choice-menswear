import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', (req: AuthRequest, res: Response) => {
  const { gender } = req.query;
  let categories = db.data.categories.filter(c => c.status === 'ACTIVE');

  if (gender) {
    categories = categories.filter(c => c.gender.toUpperCase() === (gender as string).toUpperCase() || c.gender === 'UNISEX');
  }

  // Attach product counts
  const result = categories.map(cat => {
    const productCount = db.data.products.filter(p => p.category_id === cat.id && p.status === 'ACTIVE').length;
    return { ...cat, product_count: productCount };
  });

  res.json({ categories: result });
});

router.post('/', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { name, gender, image_url } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name required' });

  const id = `cat-${Date.now()}`;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const now = new Date().toISOString();

  const newCat = {
    id,
    name,
    slug,
    gender: gender || 'MEN',
    image_url: image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
    status: 'ACTIVE' as const,
    created_at: now
  };

  db.data.categories.push(newCat);
  db.save();
  res.status(201).json({ category: newCat });
});

router.put('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const index = db.data.categories.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Category not found' });

  const { name, gender, image_url, status } = req.body;
  db.data.categories[index] = {
    ...db.data.categories[index],
    name: name || db.data.categories[index].name,
    gender: gender || db.data.categories[index].gender,
    image_url: image_url || db.data.categories[index].image_url,
    status: status || db.data.categories[index].status
  };

  db.save();
  res.json({ category: db.data.categories[index] });
});

router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  db.data.categories = db.data.categories.filter(c => c.id !== id);
  db.save();
  res.json({ message: 'Category deleted' });
});

export default router;
