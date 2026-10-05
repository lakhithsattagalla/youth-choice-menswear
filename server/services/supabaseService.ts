import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Supabase Client] Successfully initialized with URL:', supabaseUrl);
  } catch (err) {
    console.warn('[Supabase Client] Failed to initialize:', err);
    supabase = null;
  }
} else {
  console.log('[Supabase Client] Environment variables not provided. App running with persistent server JSON DB.');
}

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

export function getSupabaseClient(): SupabaseClient | null {
  return supabase;
}

export async function fetchProductsFromSupabase() {
  if (!supabase) return null;

  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false });

  if (prodErr) throw prodErr;
  if (!products) return [];

  const productIds = products.map(p => p.id);

  const [imagesRes, variantsRes, brandsRes, categoriesRes] = await Promise.all([
    supabase.from('product_images').select('*').in('product_id', productIds),
    supabase.from('product_variants').select('*').in('product_id', productIds),
    supabase.from('brands').select('*'),
    supabase.from('categories').select('*')
  ]);

  const images = imagesRes.data || [];
  const variants = variantsRes.data || [];
  const brands = brandsRes.data || [];
  const categories = categoriesRes.data || [];

  return products.map(p => {
    const brandObj = brands.find(b => b.id === p.brand_id);
    const catObj = categories.find(c => c.id === p.category_id);
    const pImages = images.filter(img => img.product_id === p.id);
    const pVariants = variants.filter(v => v.product_id === p.id);
    const totalStock = pVariants.reduce((sum, v) => sum + (v.stock || 0), 0);

    return {
      ...p,
      brand_name: brandObj?.name || 'Brand',
      category_name: catObj?.name || 'Category',
      images: pImages,
      variants: pVariants,
      total_stock: totalStock,
      primary_image: pImages.find(i => i.is_primary)?.image_url || pImages[0]?.image_url || '',
      price: p.selling_price,
      original_price: p.mrp
    };
  });
}

export async function deleteProductFromSupabase(productId: string): Promise<boolean> {
  if (!supabase) return false;

  const targetId = String(productId).trim();

  // Delete product (cascades to product_variants and product_images if schema FK ON DELETE CASCADE is set,
  // but explicitly deleting child records ensures clean cleanup on any Postgres setup)
  await supabase.from('product_images').delete().eq('product_id', targetId);
  await supabase.from('product_variants').delete().eq('product_id', targetId);
  await supabase.from('wishlist_items').delete().eq('product_id', targetId);

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', targetId);

  if (error) {
    console.error('[Supabase Delete Product Error]:', error);
    throw new Error(`Supabase deletion error: ${error.message}`);
  }

  return true;
}

export async function createProductInSupabase(prodData: any) {
  if (!supabase) return null;

  const prodId = prodData.id || `prod-${Date.now()}`;
  const slug = prodData.slug || prodData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const discount_pct = Math.round(((prodData.mrp - prodData.selling_price) / prodData.mrp) * 100);
  const now = new Date().toISOString();

  const newProduct = {
    id: prodId,
    name: prodData.name,
    slug,
    brand_id: prodData.brand_id,
    category_id: prodData.category_id,
    gender: prodData.gender || 'MEN',
    description: prodData.description || '',
    material: prodData.material || '',
    fit: prodData.fit || '',
    care_instructions: prodData.care_instructions || '',
    mrp: Number(prodData.mrp),
    selling_price: Number(prodData.selling_price),
    discount_pct,
    sku_prefix: prodData.sku_prefix,
    rating: 5.0,
    review_count: 0,
    is_featured: true,
    is_trending: true,
    is_new_arrival: true,
    status: 'ACTIVE',
    created_at: now,
    updated_at: now
  };

  const { error: prodErr } = await supabase.from('products').insert([newProduct]);
  if (prodErr) throw prodErr;

  if (Array.isArray(prodData.images) && prodData.images.length > 0) {
    const imgRecords = prodData.images.map((img: any, idx: number) => ({
      id: `img-${prodId}-${idx}`,
      product_id: prodId,
      image_url: typeof img === 'string' ? img : img.url,
      color: img.color || '',
      is_primary: idx === 0 || img.is_primary,
      display_order: idx
    }));
    await supabase.from('product_images').insert(imgRecords);
  }

  if (Array.isArray(prodData.variants) && prodData.variants.length > 0) {
    const varRecords = prodData.variants.map((v: any) => ({
      id: `var-${prodId}-${v.color}-${v.size}`,
      product_id: prodId,
      color: v.color,
      size: v.size,
      sku: v.sku || `${prodData.sku_prefix}-${(v.color || 'CLR').substring(0, 2).toUpperCase()}-${v.size}`,
      stock: Number(v.stock || 0),
      created_at: now
    }));
    await supabase.from('product_variants').insert(varRecords);
  }

  return newProduct;
}

export async function updateProductInSupabase(productId: string, prodData: any) {
  if (!supabase) return null;

  const targetId = String(productId).trim();
  const newMrp = Number(prodData.mrp);
  const newSelling = Number(prodData.selling_price);
  const discount_pct = Math.round(((newMrp - newSelling) / newMrp) * 100);
  const slug = prodData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const updateFields = {
    name: prodData.name,
    slug,
    brand_id: prodData.brand_id,
    category_id: prodData.category_id,
    gender: prodData.gender || 'MEN',
    description: prodData.description || '',
    material: prodData.material || '',
    fit: prodData.fit || '',
    care_instructions: prodData.care_instructions || '',
    mrp: newMrp,
    selling_price: newSelling,
    discount_pct,
    sku_prefix: prodData.sku_prefix,
    status: prodData.status || 'ACTIVE',
    updated_at: new Date().toISOString()
  };

  const { error: updateErr } = await supabase
    .from('products')
    .update(updateFields)
    .eq('id', targetId);

  if (updateErr) throw updateErr;

  if (Array.isArray(prodData.images)) {
    await supabase.from('product_images').delete().eq('product_id', targetId);
    const imgRecords = prodData.images.map((img: any, idx: number) => ({
      id: `img-${targetId}-${idx}-${Date.now()}`,
      product_id: targetId,
      image_url: typeof img === 'string' ? img : img.url,
      color: img.color || '',
      is_primary: idx === 0 || img.is_primary,
      display_order: idx
    }));
    await supabase.from('product_images').insert(imgRecords);
  }

  if (Array.isArray(prodData.variants)) {
    await supabase.from('product_variants').delete().eq('product_id', targetId);
    const varRecords = prodData.variants.map((v: any) => ({
      id: `var-${targetId}-${v.color}-${v.size}-${Date.now()}`,
      product_id: targetId,
      color: v.color,
      size: v.size,
      sku: v.sku || `${prodData.sku_prefix}-${(v.color || 'CLR').substring(0, 2).toUpperCase()}-${v.size}`,
      stock: Number(v.stock || 0),
      created_at: new Date().toISOString()
    }));
    await supabase.from('product_variants').insert(varRecords);
  }

  return { id: targetId, ...updateFields };
}
