import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { apiRequest } from '../../services/api';

export const AdminBrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [logo, setLogo] = useState<string>('');
  const [desc, setDesc] = useState<string>('');

  const fetchBrands = async () => {
    const res = await apiRequest('/brands');
    setBrands(res.brands || []);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await apiRequest('/brands', {
        method: 'POST',
        body: JSON.stringify({ name, logo, description: desc })
      });
      setShowModal(false);
      setName(''); setLogo(''); setDesc('');
      await fetchBrands();
    } catch (err: any) {
      alert(err.message || 'Failed to add brand');
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!window.confirm('Delete brand?')) return;
    try {
      await apiRequest(`/brands/${id}`, { method: 'DELETE' });
      await fetchBrands();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">BRAND CATALOG</span>
          <h1 className="text-2xl font-display font-bold text-white uppercase">Brand Management</h1>
        </div>

        <button onClick={() => setShowModal(true)} className="bg-amber-500 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add New Brand</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {brands.map(b => (
          <div key={b.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-white text-base">{b.name}</h3>
                <span className="bg-amber-500/10 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">{b.product_count || 4} Products</span>
              </div>
              <p className="text-xs text-slate-400">{b.description}</p>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-neutral-800 text-xs">
              <span className="text-emerald-400 font-bold uppercase text-[10px]">{b.status}</span>
              <button onClick={() => handleDeleteBrand(b.id)} className="text-red-400 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Add New Brand</h3>
            <form onSubmit={handleAddBrand} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Brand Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Calvin Klein" className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Logo URL (Optional)</label>
                <input type="text" value={logo} onChange={e => setLogo(e.target.value)} placeholder="https://..." className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3" />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-neutral-800 text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-amber-500 text-black font-bold rounded-lg">Save Brand</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
