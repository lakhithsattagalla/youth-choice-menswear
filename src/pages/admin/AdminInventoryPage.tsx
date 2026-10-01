import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, Check, RefreshCw, Save } from 'lucide-react';
import { apiRequest } from '../../services/api';

export const AdminInventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Inline stock edits state
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});
  const [saveSuccess, setSaveSuccess] = useState<string>('');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/admin/inventory');
      setInventory(res.inventory || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = (variantId: string, val: number) => {
    setStockEdits(prev => ({ ...prev, [variantId]: Math.max(0, val) }));
  };

  const handleSaveStock = async (variantId: string) => {
    const newStock = stockEdits[variantId];
    if (newStock === undefined) return;

    try {
      await apiRequest(`/admin/inventory/${variantId}`, {
        method: 'PUT',
        body: JSON.stringify({ stock: newStock })
      });
      setSaveSuccess(`Stock updated for SKU! Customer catalog updated.`);
      setTimeout(() => setSaveSuccess(''), 3000);
      await fetchInventory();
    } catch (err: any) {
      alert(err.message || 'Failed to update stock');
    }
  };

  const filtered = inventory.filter(v => {
    const matchesSearch = 
      v.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">STOCK MATRIX</span>
          <h1 className="text-2xl font-display font-bold text-white uppercase">Variant Inventory Management</h1>
        </div>

        <button 
          onClick={fetchInventory}
          className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-2"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Refresh Stock</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-900 border border-neutral-800 p-4 rounded-2xl">
        <div className="md:col-span-2 flex items-center space-x-3 bg-neutral-950 border border-neutral-800 px-3 py-2 rounded-xl">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input 
            type="text" 
            placeholder="Search by SKU, product name, or brand..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-white text-xs focus:outline-none"
          />
        </div>

        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 font-semibold"
        >
          <option value="ALL">All Stock Statuses</option>
          <option value="IN STOCK">IN STOCK (&gt;5)</option>
          <option value="LOW STOCK">LOW STOCK (1-5)</option>
          <option value="OUT OF STOCK">OUT OF STOCK (0)</option>
        </select>
      </div>

      {/* Inventory SKU Matrix Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-slate-400 uppercase tracking-wider bg-neutral-950">
                <th className="py-3.5 px-4">Variant SKU</th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Color</th>
                <th className="py-3.5 px-4">Size</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Update Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-slate-200">
              {filtered.map(item => {
                const currentEdit = stockEdits[item.id] !== undefined ? stockEdits[item.id] : item.stock;
                const isModified = stockEdits[item.id] !== undefined && stockEdits[item.id] !== item.stock;

                return (
                  <tr key={item.id} className="hover:bg-neutral-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{item.sku}</td>
                    <td className="py-3 px-4 font-bold text-white">{item.product_name}</td>
                    <td className="py-3 px-4 font-semibold text-slate-300">{item.color}</td>
                    <td className="py-3 px-4 font-extrabold text-white">{item.size}</td>
                    <td className="py-3 px-4 font-extrabold text-base text-white">{item.stock}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                        item.status === 'IN STOCK' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                        item.status === 'LOW STOCK' ? 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse' :
                        'bg-red-950 text-red-300 border-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="number" 
                          min="0"
                          value={currentEdit}
                          onChange={e => handleStockChange(item.id, Number(e.target.value))}
                          className="w-16 bg-neutral-950 border border-neutral-700 text-white rounded-lg p-1.5 text-center font-bold text-xs"
                        />
                        {isModified && (
                          <button 
                            onClick={() => handleSaveStock(item.id)}
                            className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold p-2 rounded-lg flex items-center space-x-1 text-[11px]"
                            title="Save inline stock update"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
