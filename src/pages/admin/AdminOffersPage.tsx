import React, { useState, useEffect } from 'react';
import { Plus, Tag } from 'lucide-react';
import { apiRequest } from '../../services/api';

export const AdminOffersPage: React.FC = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [discountTag, setDiscountTag] = useState('UP TO 50% OFF');

  const fetchOffers = async () => {
    const res = await apiRequest('/admin/offers');
    setOffers(res.offers || []);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/admin/offers', {
        method: 'POST',
        body: JSON.stringify({
          title,
          subtitle,
          banner_url: bannerUrl,
          discount_tag: discountTag
        })
      });
      setShowModal(false);
      setTitle(''); setBannerUrl('');
      await fetchOffers();
    } catch (err: any) {
      alert(err.message || 'Failed to create offer banner');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">HOMEPAGE CAMPAIGNS</span>
          <h1 className="text-2xl font-display font-bold text-white uppercase">Offer Banners Management</h1>
        </div>

        <button onClick={() => setShowModal(true)} className="bg-amber-500 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Offer Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map(off => (
          <div key={off.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden space-y-3 p-4">
            <img src={off.banner_url} alt="" className="w-full h-40 object-cover rounded-xl" />
            <div>
              <span className="bg-amber-500 text-black font-extrabold text-[10px] px-2 py-0.5 rounded">{off.discount_tag}</span>
              <h3 className="font-bold text-white text-base mt-1">{off.title}</h3>
              <p className="text-xs text-slate-400">{off.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Add Offer Banner</h3>
            <form onSubmit={handleCreateOffer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Banner Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. FESTIVE FLASH DEALS" className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Subtitle</label>
                <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="e.g. Special discounts on festive kurtis" className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Banner Image URL</label>
                <input type="text" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} required placeholder="https://..." className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Discount Tag Badge</label>
                <input type="text" value={discountTag} onChange={e => setDiscountTag(e.target.value)} required placeholder="e.g. FLAT 40% OFF" className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3" />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-neutral-800 text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-amber-500 text-black font-bold rounded-lg">Save Offer Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
