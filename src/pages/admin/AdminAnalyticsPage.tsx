import React, { useState, useEffect } from 'react';
import { BarChart3, Eye, Heart, ShoppingBag, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { apiRequest } from '../../services/api';

export const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    apiRequest('/admin/analytics').then(res => setAnalytics(res));
  }, []);

  if (!analytics) return <div className="p-8 text-xs text-slate-400">Loading analytics data...</div>;

  const colors = ['#c5a059', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8">
      <div className="border-b border-neutral-800 pb-4">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">BUSINESS INTELLIGENCE</span>
        <h1 className="text-2xl font-display font-bold text-white uppercase">User Engagement & Conversion Analytics</h1>
      </div>

      {/* Conversion Funnel Table & Chart */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-6">
        <h3 className="font-bold text-white uppercase text-sm">User Conversion Funnel Progression</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {analytics.funnel?.map((stage: any, idx: number) => (
            <div key={stage.stage} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">{stage.stage}</span>
              <p className="text-xl font-extrabold text-white">{stage.count.toLocaleString()}</p>
              <span className="text-[10px] font-bold text-amber-400">{stage.percentage}% conversion</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Product Engagement */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-white uppercase text-sm">Most Engaged Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-slate-400 uppercase tracking-wider bg-neutral-950">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Product Views</th>
                <th className="py-3 px-4">Wishlist Adds</th>
                <th className="py-3 px-4">Cart Adds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-slate-200">
              {analytics.productEngagement?.map((item: any) => (
                <tr key={item.id} className="hover:bg-neutral-800/40">
                  <td className="py-3 px-4 font-bold text-white">{item.name}</td>
                  <td className="py-3 px-4 text-amber-400 font-semibold">{item.brand}</td>
                  <td className="py-3 px-4 font-mono">{item.views} Views</td>
                  <td className="py-3 px-4 font-mono">{item.wishlists} Saves</td>
                  <td className="py-3 px-4 font-bold text-emerald-400">{item.carts} Carts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
