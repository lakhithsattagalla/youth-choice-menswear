import React, { useState, useEffect } from 'react';
import { Plus, Tag } from 'lucide-react';
import { apiRequest } from '../../services/api';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('FIXED');
  const [discountValue, setDiscountValue] = useState(100);
  const [minOrder, setMinOrder] = useState(999);

  const fetchCoupons = async () => {
    const res = await apiRequest('/admin/coupons');
    setCoupons(res.coupons || []);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify({
          code,
          discount_type: discountType,
          discount_value: discountValue,
          min_order_amount: minOrder
        })
      });
      setShowModal(false);
      setCode('');
      await fetchCoupons();
    } catch (err: any) {
      alert(err.message || 'Failed to create coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">PROMOTIONAL DISCOUNTS</span>
          <h1 className="text-2xl font-display font-bold text-white uppercase">Coupons Management</h1>
        </div>

        <button onClick={() => setShowModal(true)} className="bg-amber-500 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coupons.map(cpn => (
          <div key={cpn.id} className="bg-neutral-900 border border-dashed border-amber-500/40 p-5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-mono font-extrabold text-base text-amber-400">{cpn.code}</span>
              <span className="bg-amber-500/10 text-amber-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase">{cpn.status}</span>
            </div>
            <p className="text-xs text-white font-bold">
              {cpn.discount_type === 'FIXED' ? `Flat ₹${cpn.discount_value} OFF` : `${cpn.discount_value}% OFF`}
            </p>
            <p className="text-[11px] text-slate-400">Min. Order Amount: ₹{cpn.min_order_amount}</p>
            <p className="text-[10px] text-slate-500">Used {cpn.usage_count || 0} times</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Create Coupon Code</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Coupon Code (Uppercase)</label>
                <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required placeholder="e.g. SUMMER15" className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Type</label>
                  <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3">
                    <option value="FIXED">Fixed Amount (₹)</option>
                    <option value="PERCENT">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Discount Value</label>
                  <input type="number" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} required className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3" />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Min. Order Amount (₹)</label>
                <input type="number" value={minOrder} onChange={e => setMinOrder(Number(e.target.value))} required className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3" />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-neutral-800 text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-amber-500 text-black font-bold rounded-lg">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
