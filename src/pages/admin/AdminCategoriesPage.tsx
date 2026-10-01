import React, { useState, useEffect } from 'react';
import { Plus, Grid, Trash2 } from 'lucide-react';
import { apiRequest } from '../../services/api';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<string>('MEN');
  const [imgUrl, setImgUrl] = useState<string>('');

  const fetchCategories = async () => {
    const res = await apiRequest('/categories');
    setCategories(res.categories || []);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await apiRequest('/categories', {
        method: 'POST',
        body: JSON.stringify({ name, gender, image_url: imgUrl })
      });
      setShowModal(false);
      setName(''); setImgUrl('');
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await apiRequest(`/categories/${id}`, { method: 'DELETE' });
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">CATEGORY MANAGEMENT</span>
          <h1 className="text-2xl font-display font-bold text-white uppercase">Men & Women Categories</h1>
        </div>

        <button onClick={() => setShowModal(true)} className="bg-amber-500 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="relative h-44 rounded-2xl overflow-hidden border border-neutral-800 group">
            <img src={cat.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex flex-col justify-end">
              <span className="text-[10px] text-amber-400 font-bold uppercase">{cat.gender}</span>
              <h3 className="font-bold text-white text-sm">{cat.name}</h3>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] text-slate-300">{cat.product_count || 5} Products</span>
                <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:underline text-[11px]">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Add New Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Category Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Blazers & Suits" className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3">
                  <option value="MEN">Men</option>
                  <option value="WOMEN">Women</option>
                  <option value="UNISEX">Unisex</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Cover Image URL</label>
                <input type="text" value={imgUrl} onChange={e => setImgUrl(e.target.value)} placeholder="https://..." className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3" />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-neutral-800 text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-amber-500 text-black font-bold rounded-lg">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
