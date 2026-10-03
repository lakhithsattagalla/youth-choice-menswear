import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Admin Dashboard Summary Metrics
router.get('/dashboard-stats', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const totalOrders = db.data.orders.length;
  const totalRevenue = db.data.orders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.grand_total : 0), 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrdersList = db.data.orders.filter(o => o.created_at.startsWith(todayStr));
  const todayOrders = todayOrdersList.length;
  const todayRevenue = todayOrdersList.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.grand_total : 0), 0);

  const totalCustomers = db.data.users.filter(u => u.role === 'CUSTOMER').length;
  const activeProducts = db.data.products.filter(p => p.status === 'ACTIVE').length;

  let lowStockCount = 0;
  let outOfStockCount = 0;

  db.data.product_variants.forEach(v => {
    if (v.stock === 0) outOfStockCount++;
    else if (v.stock <= 5) lowStockCount++;
  });

  res.json({
    totalRevenue,
    todayRevenue,
    totalOrders,
    todayOrders,
    totalCustomers,
    activeProducts,
    lowStockCount,
    outOfStockCount
  });
});

// Dedicated Inventory Management (SKU level: Product + Color + Size)
router.get('/inventory', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { search, status } = req.query as Record<string, string>;

  let variants = db.data.product_variants.map(v => {
    const product = db.data.products.find(p => p.id === v.product_id);
    const brand = product ? db.data.brands.find(b => b.id === product.brand_id) : null;

    let stockStatus = 'IN STOCK';
    if (v.stock === 0) stockStatus = 'OUT OF STOCK';
    else if (v.stock <= 5) stockStatus = 'LOW STOCK';

    return {
      id: v.id,
      product_id: v.product_id,
      product_name: product?.name || 'Unknown Product',
      brand_name: brand?.name || 'Brand',
      sku: v.sku,
      color: v.color,
      size: v.size,
      stock: v.stock,
      status: stockStatus,
      updated_at: v.created_at
    };
  });

  if (status && status !== 'ALL') {
    variants = variants.filter(v => v.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    variants = variants.filter(v =>
      v.product_name.toLowerCase().includes(q) ||
      v.sku.toLowerCase().includes(q) ||
      v.brand_name.toLowerCase().includes(q)
    );
  }

  res.json({ inventory: variants, count: variants.length });
});

// Update Inventory Stock Count per SKU
router.put('/inventory/:variantId', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { variantId } = req.params;
  const { stock } = req.body;

  const idx = db.data.product_variants.findIndex(v => v.id === variantId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Variant not found' });
  }

  db.data.product_variants[idx].stock = Math.max(0, Number(stock));
  db.save();

  res.json({ message: 'Stock updated successfully', variant: db.data.product_variants[idx] });
});

// Customer Management
router.get('/customers', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { search } = req.query as Record<string, string>;
  let customers = db.data.users.filter(u => u.role === 'CUSTOMER');

  if (search) {
    const q = search.toLowerCase();
    customers = customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q))
    );
  }

  const result = customers.map(c => {
    const userOrders = db.data.orders.filter(o => o.user_id === c.id);
    const totalSpent = userOrders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.grand_total : 0), 0);
    const { password_hash, ...safeUser } = c;
    return {
      ...safeUser,
      orders_count: userOrders.length,
      total_spent: totalSpent
    };
  });

  res.json({ customers: result });
});

// Coupons Management CRUD
router.get('/coupons', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  res.json({ coupons: db.data.coupons });
});

router.post('/coupons', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { code, discount_type, discount_value, min_order_amount } = req.body;
  if (!code || !discount_value) return res.status(400).json({ error: 'Code and discount value required' });

  const newCoupon = {
    id: `cpn-${Date.now()}`,
    code: code.toUpperCase(),
    discount_type: discount_type || 'FIXED',
    discount_value: Number(discount_value),
    min_order_amount: Number(min_order_amount || 0),
    status: 'ACTIVE' as const,
    usage_count: 0,
    created_at: new Date().toISOString()
  };

  db.data.coupons.push(newCoupon);
  db.save();
  res.status(201).json({ coupon: newCoupon });
});

router.put('/coupons/:id/status', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const idx = db.data.coupons.findIndex(c => c.id === id);
  if (idx > -1) {
    db.data.coupons[idx].status = status;
    db.save();
  }
  res.json({ coupon: db.data.coupons[idx] });
});

router.delete('/coupons/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  db.data.coupons = db.data.coupons.filter(c => c.id !== id);
  db.save();
  res.json({ message: 'Coupon deleted successfully' });
});

// Offers Management CRUD
router.get('/offers', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  res.json({ offers: db.data.offers });
});

router.post('/offers', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { title, subtitle, banner_url, discount_tag, link_url } = req.body;
  if (!title || !banner_url) return res.status(400).json({ error: 'Title and banner image required' });

  const newOffer = {
    id: `off-${Date.now()}`,
    title,
    subtitle: subtitle || '',
    banner_url,
    discount_tag: discount_tag || '',
    link_url: link_url || '/products',
    status: 'ACTIVE' as const,
    created_at: new Date().toISOString()
  };

  db.data.offers.push(newOffer);
  db.save();
  res.status(201).json({ offer: newOffer });
});

router.delete('/offers/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  db.data.offers = db.data.offers.filter(o => o.id !== id);
  db.save();
  res.json({ message: 'Offer deleted successfully' });
});

// User Response & Business Analytics
router.get('/analytics', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const events = db.data.analytics_events;

  const totalVisitors = 1450;
  const productViews = events.filter(e => e.event_type === 'PRODUCT_VIEW').length + 820;
  const addToCartCount = events.filter(e => e.event_type === 'ADD_TO_CART').length + 340;
  const checkoutCount = events.filter(e => e.event_type === 'CHECKOUT_STARTED').length + 190;
  const whatsappOrders = events.filter(e => e.event_type === 'WHATSAPP_ORDER').length + db.data.orders.length;
  const confirmedOrders = db.data.orders.filter(o => o.status !== 'CANCELLED').length;

  const funnel = [
    { stage: 'Visitors', count: totalVisitors, percentage: 100 },
    { stage: 'Product Views', count: productViews, percentage: Math.round((productViews / totalVisitors) * 100) },
    { stage: 'Add to Cart', count: addToCartCount, percentage: Math.round((addToCartCount / totalVisitors) * 100) },
    { stage: 'Checkout Started', count: checkoutCount, percentage: Math.round((checkoutCount / totalVisitors) * 100) },
    { stage: 'WhatsApp Orders', count: whatsappOrders, percentage: Math.round((whatsappOrders / totalVisitors) * 100) },
    { stage: 'Confirmed Orders', count: confirmedOrders, percentage: Math.round((confirmedOrders / totalVisitors) * 100) }
  ];

  // Most Engagement Products
  const productEngagement = db.data.products.slice(0, 5).map(p => {
    const pEvents = events.filter(e => e.product_id === p.id);
    const views = pEvents.filter(e => e.event_type === 'PRODUCT_VIEW').length + 150;
    const wishlists = pEvents.filter(e => e.event_type === 'WISHLIST_ADD').length + 35;
    const carts = pEvents.filter(e => e.event_type === 'ADD_TO_CART').length + 22;

    const brand = db.data.brands.find(b => b.id === p.brand_id);

    return {
      id: p.id,
      name: p.name,
      brand: brand?.name || 'Brand',
      views,
      wishlists,
      carts
    };
  });

  // Daily Revenue (last 7 days demo)
  const revenueChart = [
    { day: 'Mon', revenue: 14500, orders: 8 },
    { day: 'Tue', revenue: 22100, orders: 12 },
    { day: 'Wed', revenue: 18400, orders: 9 },
    { day: 'Thu', revenue: 29500, orders: 15 },
    { day: 'Fri', revenue: 35000, orders: 19 },
    { day: 'Sat', revenue: 48200, orders: 24 },
    { day: 'Sun', revenue: 41800, orders: 21 }
  ];

  res.json({
    funnel,
    productEngagement,
    revenueChart
  });
});

export default router;
