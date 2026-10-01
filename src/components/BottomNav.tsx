import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Heart, ShoppingCart, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      path: '/',
      icon: (active: boolean) => (
        <Home className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${active ? 'text-amber-400 stroke-[2.5] scale-110' : 'text-slate-300 stroke-[2]'}`} />
      )
    },
    {
      id: 'you',
      label: 'You',
      path: user ? '/account' : '/login',
      icon: (active: boolean) => (
        <User className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${active ? 'text-amber-400 stroke-[2.5] scale-110' : 'text-slate-300 stroke-[2]'}`} />
      )
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      path: '/wishlist',
      badge: wishlistCount > 0 ? wishlistCount : undefined,
      icon: (active: boolean) => (
        <div className="relative">
          <Heart className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${active ? 'text-amber-400 stroke-[2.5] scale-110 fill-amber-400/20' : 'text-slate-300 stroke-[2]'}`} />
          {wishlistCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-amber-500 text-black font-bold text-[10px] min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center border border-black shadow-sm">
              {wishlistCount}
            </span>
          )}
        </div>
      )
    },
    {
      id: 'cart',
      label: 'Cart',
      path: '/cart',
      badge: cartCount > 0 ? cartCount : undefined,
      icon: (active: boolean) => (
        <div className="relative">
          <ShoppingCart className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${active ? 'text-amber-400 stroke-[2.5] scale-110' : 'text-slate-300 stroke-[2]'}`} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-amber-500 text-black font-bold text-[10px] min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center border border-black shadow-sm">
              {cartCount}
            </span>
          )}
        </div>
      )
    },
    {
      id: 'browse',
      label: 'Browse',
      path: '/products',
      icon: (active: boolean) => (
        <Menu className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${active ? 'text-amber-400 stroke-[2.5] scale-110' : 'text-slate-300 stroke-[2]'}`} />
      )
    }
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 shadow-[0_-4px_25px_rgba(0,0,0,0.8)] py-2 px-1">
      <div className="max-w-md sm:max-w-lg mx-auto grid grid-cols-5 items-center text-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
              className="flex flex-col items-center justify-center py-0.5 group focus:outline-none"
            >
              <div className="flex items-center justify-center h-6 mb-0.5 relative">
                {item.icon(isActive)}
              </div>
              <span className={`text-[11px] tracking-tight leading-tight transition-colors ${
                isActive ? 'text-amber-400 font-extrabold' : 'text-slate-300 font-semibold group-hover:text-amber-400'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
