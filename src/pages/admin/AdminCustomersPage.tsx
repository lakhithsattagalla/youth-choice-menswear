import React, { useState, useEffect } from 'react';
import { Search, UserCheck } from 'lucide-react';
import { apiRequest } from '../../services/api';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    apiRequest('/admin/customers').then(res => setCustomers(res.customers || []));
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-800 pb-4">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">CUSTOMER RELATIONSHIPS</span>
        <h1 className="text-2xl font-display font-bold text-white uppercase">Registered Customers ({customers.length})</h1>
      </div>

      <div className="flex items-center space-x-3 bg-neutral-900 border border-neutral-800 p-3 rounded-2xl">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input 
          type="text" 
          placeholder="Search customer by name, email, phone..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-white text-xs focus:outline-none"
        />
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-slate-400 uppercase tracking-wider bg-neutral-950">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Lifetime Spend</th>
                <th className="py-3.5 px-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-slate-200">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-neutral-800/40">
                  <td className="py-3 px-4">
                    <p className="font-bold text-white">{c.name}</p>
                    <p className="text-[10px] text-slate-400">{c.email}</p>
                  </td>
                  <td className="py-3 px-4 font-mono">{c.phone || 'N/A'}</td>
                  <td className="py-3 px-4 font-bold text-white">{c.orders_count || 0} Orders</td>
                  <td className="py-3 px-4 font-extrabold text-amber-400">₹{c.total_spent?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-400">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
