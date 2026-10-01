import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

export const WishlistPage: React.FC = () => {
  const { items, removeItem } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-20 px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto text-amber-400">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white uppercase">Your Wishlist is Empty</h2>
        <p className="text-slate-400 text-xs">Save your favorite contemporary menswear items for later.</p>
        <Link 
          to="/products"
          className="inline-flex items-center space-x-2 bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-xl shadow-amber-500/10 hover:bg-amber-400 transition-colors"
        >
          <span>DISCOVER STYLES</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-neutral-800 pb-4">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">SAVED ITEMS</span>
        <h1 className="text-3xl font-display font-bold text-white uppercase">My Wishlist ({items.length})</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between group">
            <div className="relative aspect-[4/5] bg-neutral-950">
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover object-top" />
              <button
                onClick={() => removeItem(item.product_id)}
                className="absolute top-3 right-3 bg-black/70 p-2 rounded-full text-red-400 hover:bg-red-950 transition-colors"
                title="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{item.brand_name}</span>
                <Link to={`/products/${item.product_id}`} className="block text-sm font-bold text-white line-clamp-1 hover:text-amber-300">
                  {item.name}
                </Link>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-base font-extrabold text-white">₹{item.selling_price.toLocaleString()}</span>
                {item.mrp > item.selling_price && (
                  <span className="text-xs text-slate-500 line-through">₹{item.mrp.toLocaleString()}</span>
                )}
              </div>

              <Link
                to={`/products/${item.product_id}`}
                className="block text-center w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all"
              >
                SELECT SIZE & BUY
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
