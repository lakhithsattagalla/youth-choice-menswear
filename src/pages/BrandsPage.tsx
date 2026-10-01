import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api';

export const BrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    apiRequest('/brands').then(res => setBrands(res.brands || []));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-neutral-800 pb-4">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">AUTHENTIC APPAREL</span>
        <h1 className="text-3xl font-display font-bold text-white uppercase">Featured Fashion Brands</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map(brand => (
          <Link
            key={brand.id}
            to={`/products?brand=${brand.id}`}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-amber-500/40 hover:bg-neutral-800/80 transition-all group"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-display font-extrabold text-white group-hover:text-amber-400 transition-colors">{brand.name}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{brand.description}</p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-neutral-800 text-xs">
              <span className="text-amber-400 font-bold">{brand.product_count || 4} Available Products</span>
              <span className="text-white font-semibold group-hover:translate-x-1 transition-transform">Browse →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
