import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartPage: React.FC = () => {
  const { items, summary, updateQuantity, removeItem, isLoading } = useCart();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-4 animate-shimmer">
        <div className="h-48 bg-neutral-900 rounded-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-20 px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto text-amber-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white uppercase">Your Cart is Empty</h2>
        <p className="text-slate-400 text-xs">Explore our contemporary menswear collection and add your favorite items.</p>
        <Link 
          to="/products"
          className="inline-flex items-center space-x-2 bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-xl shadow-amber-500/10 hover:bg-amber-400 transition-colors"
        >
          <span>CONTINUE SHOPPING</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title */}
      <div className="border-b border-neutral-800 pb-4">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">CHECKOUT PIPELINE</span>
        <h1 className="text-3xl font-display font-bold text-white uppercase">Shopping Cart ({items.length} Items)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div 
              key={item.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="w-20 h-24 object-cover object-top rounded-xl bg-neutral-950 border border-neutral-800 shrink-0"
                />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{item.brand_name}</span>
                  <Link to={`/products/${item.product_id}`} className="block text-sm font-bold text-white hover:text-amber-300">
                    {item.name}
                  </Link>
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span>Color: <strong className="text-slate-200">{item.color}</strong></span>
                    <span>|</span>
                    <span>Size: <strong className="text-slate-200">{item.size}</strong></span>
                  </div>
                  <div className="flex items-baseline space-x-2 pt-1">
                    <span className="text-sm font-bold text-white">₹{item.unit_price.toLocaleString()}</span>
                    {item.mrp > item.unit_price && (
                      <span className="text-xs text-slate-500 line-through">₹{item.mrp.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity controls and remove */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6 border-t sm:border-t-0 border-neutral-800 pt-3 sm:pt-0">
                <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-1">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-neutral-800"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-white text-xs">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-neutral-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-sm font-extrabold text-amber-400">₹{item.total_price.toLocaleString()}</p>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-red-400 hover:underline flex items-center space-x-1 mt-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl h-fit space-y-6">
          <h3 className="font-bold text-white uppercase tracking-wider text-sm border-b border-neutral-800 pb-3">Order Summary</h3>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-white font-semibold">₹{summary.subtotal.toLocaleString()}</span>
            </div>
            {summary.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Total Discount</span>
                <span>-₹{summary.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span className="text-white font-semibold">
                {summary.delivery_fee === 0 ? <strong className="text-emerald-400 uppercase">Free</strong> : `₹${summary.delivery_fee}`}
              </span>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-4 flex justify-between items-baseline">
            <span className="text-sm font-bold text-white uppercase">Grand Total</span>
            <span className="text-2xl font-extrabold text-amber-400">₹{summary.grand_total.toLocaleString()}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl shadow-xl shadow-amber-500/10 flex items-center justify-center space-x-2 transition-all"
          >
            <span>PROCEED TO CHECKOUT</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Orders verified & processed directly via WhatsApp Business chat.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
