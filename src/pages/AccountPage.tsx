import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Heart, MapPin, Bell, LogOut, Package, CheckCircle, Clock, Truck, ChevronRight, Plus, Edit2, Trash2, Check, Star, X, Building, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { apiRequest } from '../services/api';

export const AccountPage: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Profile Edit State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileGender, setProfileGender] = useState(user?.gender || 'MALE');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Selected Order Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Address Modal State (Add / Edit)
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    recipient_name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
    type: 'HOME',
    is_default: false
  });
  const [addressSuccess, setAddressSuccess] = useState<string>('');

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [ordRes, addrRes, notifRes] = await Promise.all([
        apiRequest('/orders/my-orders'),
        apiRequest('/user/addresses'),
        apiRequest('/user/notifications')
      ]);
      setOrders(ordRes.orders || []);
      setAddresses(addrRes.addresses || []);
      setNotifications(notifRes.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: profileName,
        phone: profilePhone,
        gender: profileGender
      });
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm({
      recipient_name: user?.name || '',
      phone: user?.phone || '',
      street: '',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
      type: 'HOME',
      is_default: addresses.length === 0
    });
    setShowAddressModal(true);
  };

  const openEditAddressModal = (addr: any) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      recipient_name: addr.recipient_name,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      type: addr.type || 'HOME',
      is_default: !!addr.is_default
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await apiRequest(`/user/addresses/${editingAddressId}`, {
          method: 'PUT',
          body: JSON.stringify(addressForm)
        });
        setAddressSuccess('Address updated successfully!');
      } else {
        await apiRequest('/user/addresses', {
          method: 'POST',
          body: JSON.stringify(addressForm)
        });
        setAddressSuccess('New delivery address added successfully!');
      }

      setShowAddressModal(false);
      setTimeout(() => setAddressSuccess(''), 3000);
      await fetchUserData();
    } catch (err: any) {
      alert(err.message || 'Failed to save address');
    }
  };

  const handleSetDefaultAddress = async (addrId: string) => {
    try {
      await apiRequest(`/user/addresses/${addrId}`, {
        method: 'PUT',
        body: JSON.stringify({ is_default: true })
      });
      setAddressSuccess('Default delivery address updated!');
      setTimeout(() => setAddressSuccess(''), 3000);
      await fetchUserData();
    } catch (err: any) {
      alert(err.message || 'Failed to update default address');
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    if (!window.confirm('Are you sure you want to remove this delivery address?')) return;
    try {
      setAddresses(prev => prev.filter(a => a.id !== addrId));
      await apiRequest(`/user/addresses/${addrId}`, { method: 'DELETE' });
      setAddressSuccess('Address removed from your portal');
      setTimeout(() => setAddressSuccess(''), 3000);
      await fetchUserData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete address');
      await fetchUserData();
    }
  };

  if (!user) return null;

  const pendingOrdersCount = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'DELIVERED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-amber-950/40 to-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-extrabold text-2xl text-amber-400">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Welcome back, {user.name} 👋</h1>
            <p className="text-xs text-slate-400 mt-0.5">{user.email} • Member since 2026</p>
          </div>
        </div>

        {/* Dashboard Quick Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          <div className="bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl text-center">
            <span className="text-xs text-slate-400 block">Total Orders</span>
            <span className="text-lg font-bold text-white">{orders.length}</span>
          </div>
          <div className="bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl text-center">
            <span className="text-xs text-slate-400 block">Pending</span>
            <span className="text-lg font-bold text-amber-400">{pendingOrdersCount}</span>
          </div>
          <div className="bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl text-center">
            <span className="text-xs text-slate-400 block">Delivered</span>
            <span className="text-lg font-bold text-emerald-400">{deliveredOrdersCount}</span>
          </div>
          <div className="bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl text-center">
            <span className="text-xs text-slate-400 block">Wishlist</span>
            <span className="text-lg font-bold text-amber-300">{wishlistCount}</span>
          </div>
        </div>
      </div>

      {/* Main Account Grid: Navigation Sidebar + Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl h-fit space-y-2">
          <Link to="/account" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-white hover:bg-neutral-800 transition-colors">
            <User className="w-4 h-4 text-amber-400" />
            <span>Profile Information</span>
          </Link>
          <Link to="/account/orders" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-white hover:bg-neutral-800 transition-colors">
            <Package className="w-4 h-4 text-amber-400" />
            <span>My Orders ({orders.length})</span>
          </Link>
          <Link to="/wishlist" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-white hover:bg-neutral-800 transition-colors">
            <Heart className="w-4 h-4 text-amber-400" />
            <span>Wishlist ({wishlistCount})</span>
          </Link>
          <Link to="/account/addresses" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-white hover:bg-neutral-800 transition-colors">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Delivery Addresses ({addresses.length})</span>
          </Link>
          <Link to="/account/notifications" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-white hover:bg-neutral-800 transition-colors">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Notifications ({notifications.length})</span>
          </Link>
          <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-neutral-800 transition-colors text-left border-t border-neutral-800 mt-2">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Routes */}
        <div className="lg:col-span-3 space-y-6">
          <Routes>

            {/* 1. Profile Tab (Default) */}
            <Route path="/" element={
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-6">
                <h3 className="font-bold text-white text-base border-b border-neutral-800 pb-3">Personal Profile Details</h3>
                {profileSuccess && <p className="text-xs text-emerald-400 font-semibold">{profileSuccess}</p>}

                <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
                      <input
                        type="text" value={profileName} onChange={e => setProfileName(e.target.value)} required
                        className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
                      <input
                        type="email" value={user.email} disabled
                        className="w-full bg-neutral-950/60 border border-neutral-800 text-slate-500 rounded-xl p-3 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
                      <input
                        type="text" value={profilePhone} onChange={e => setProfilePhone(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Gender</label>
                      <select
                        value={profileGender} onChange={e => setProfileGender(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3 focus:outline-none focus:border-amber-500"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase px-8 py-3 rounded-xl">
                    SAVE CHANGES
                  </button>
                </form>
              </div>
            } />

            {/* 2. My Orders Tab */}
            <Route path="/orders" element={
              <div className="space-y-4">
                <h3 className="font-bold text-white text-base border-b border-neutral-800 pb-3">My Orders History</h3>
                {orders.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center bg-neutral-900 rounded-2xl border border-neutral-800">No orders placed yet.</p>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                        <div>
                          <span className="text-xs font-extrabold text-amber-400 block">{order.order_number}</span>
                          <span className="text-[10px] text-slate-500">{new Date(order.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${order.status === 'DELIVERED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                              order.status === 'CANCELLED' ? 'bg-red-950 text-red-300 border-red-800' :
                                'bg-amber-950 text-amber-300 border-amber-800'
                            }`}>
                            {order.status.replace('_', ' ')}
                          </span>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-xs bg-neutral-800 hover:bg-neutral-700 text-white font-semibold px-3 py-1.5 rounded-lg"
                          >
                            View Timeline
                          </button>
                        </div>
                      </div>

                      {/* Item Preview */}
                      <div className="space-y-2">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex items-center space-x-3 text-xs text-slate-300">
                            <img src={item.image_url} alt="" className="w-10 h-12 object-cover rounded border border-neutral-800 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white line-clamp-1">{item.product_name}</p>
                              <p className="text-[10px] text-slate-400">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
                            </div>
                            <span className="font-bold text-white">₹{item.total_price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-neutral-800 pt-3 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Payment Method</span>
                          <span className="font-semibold text-white">
                            {order.payment_method === 'COD' ? 'Cash on Delivery (COD)' : 'Online UPI'}
                          </span>
                        </div>
                        {order.cod_fee > 0 && (
                          <div className="flex justify-between items-center text-amber-400">
                            <span>COD Fee</span>
                            <span className="font-semibold">+₹{order.cod_fee}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-slate-400 font-bold">Grand Total</span>
                          <span className="text-base font-extrabold text-amber-400">₹{order.grand_total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            } />

            {/* 3. MULTIPLE DELIVERY ADDRESSES MANAGEMENT TAB */}
            <Route path="/addresses" element={
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <div>
                    <h3 className="font-bold text-white text-base">Delivery Address Center</h3>
                    <p className="text-xs text-slate-400">Save multiple home, work, or custom delivery locations for fast checkout</p>
                  </div>
                  <button
                    onClick={openAddAddressModal}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-lg shadow-amber-500/10"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {addressSuccess && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-semibold flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>{addressSuccess}</span>
                  </div>
                )}

                {addresses.length === 0 ? (
                  <div className="text-center py-10 space-y-3 bg-neutral-950 rounded-2xl border border-neutral-800">
                    <MapPin className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
                    <p className="text-xs text-slate-300 font-semibold">No delivery addresses saved yet.</p>
                    <button
                      onClick={openAddAddressModal}
                      className="bg-amber-500 text-black font-bold text-xs px-5 py-2.5 rounded-xl uppercase"
                    >
                      + Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div
                        key={addr.id}
                        className={`bg-neutral-950 border p-5 rounded-2xl text-xs space-y-3 relative transition-all ${addr.is_default ? 'border-amber-500/60 shadow-lg shadow-amber-500/5' : 'border-neutral-800'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-white text-xs flex items-center space-x-1.5">
                            {addr.type === 'HOME' ? <Home className="w-3.5 h-3.5 text-amber-400" /> : <Building className="w-3.5 h-3.5 text-amber-400" />}
                            <span>{addr.recipient_name}</span>
                            <span className="bg-neutral-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">({addr.type})</span>
                          </span>

                          {addr.is_default ? (
                            <span className="bg-amber-500/20 text-amber-300 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-amber-300" />
                              <span>DEFAULT</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-[10px] text-slate-400 hover:text-amber-400 font-semibold underline"
                            >
                              Set as Default
                            </button>
                          )}
                        </div>

                        <div className="text-slate-300 space-y-0.5 text-xs">
                          <p className="font-medium text-white">{addr.street}</p>
                          <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-amber-400 font-semibold pt-1">Phone: {addr.phone}</p>
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-neutral-900">
                          <button
                            onClick={() => openEditAddressModal(addr)}
                            className="bg-neutral-900 hover:bg-neutral-800 text-slate-300 p-2 rounded-lg flex items-center space-x-1 text-[11px]"
                            title="Edit Address"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 p-2 rounded-lg transition-colors text-[11px] flex items-center space-x-1"
                            title="Delete Address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            } />

            {/* 4. Notifications Tab */}
            <Route path="/notifications" element={
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-white text-base border-b border-neutral-800 pb-3">Notifications</h3>
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400">No new notifications.</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl space-y-1 text-xs">
                      <p className="font-bold text-amber-400">{n.title}</p>
                      <p className="text-slate-300">{n.message}</p>
                      <span className="text-[10px] text-slate-500 block">{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            } />

          </Routes>
        </div>

      </div>

      {/* ADD / EDIT DELIVERY ADDRESS MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h3>
              <button onClick={() => setShowAddressModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={addressForm.recipient_name}
                    onChange={e => setAddressForm({ ...addressForm, recipient_name: e.target.value })}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={addressForm.phone}
                    onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Address Tag / Type</label>
                <div className="flex gap-2">
                  {['HOME', 'WORK', 'OFFICE', 'OTHER'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, type })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${addressForm.type === type
                          ? 'bg-amber-500 text-black border-amber-400 shadow'
                          : 'bg-neutral-950 text-slate-400 border-neutral-800 hover:border-neutral-700'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Street Address / House No. / Building</label>
                <input
                  type="text"
                  value={addressForm.street}
                  onChange={e => setAddressForm({ ...addressForm, street: e.target.value })}
                  placeholder="e.g. Flat 302, Sai Apartments, Jubilee Hills"
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Pincode</label>
                  <input
                    type="text"
                    value={addressForm.pincode}
                    onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl p-3"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addressForm.is_default}
                  onChange={e => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-800 bg-neutral-950 text-amber-500 focus:ring-0"
                />
                <span className="text-xs text-slate-300 font-semibold">Set as default delivery address</span>
              </label>

              <div className="flex justify-end space-x-3 pt-3 border-t border-neutral-800">
                <button type="button" onClick={() => setShowAddressModal(false)} className="px-5 py-2.5 bg-neutral-800 text-slate-300 rounded-xl font-semibold">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl shadow-lg shadow-amber-500/20">
                  {editingAddressId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Status Timeline Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Order Status Tracking</h3>
                <p className="text-xs text-amber-400 font-mono">{selectedOrder.order_number}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
            </div>

            {/* Timeline Progress */}
            <div className="space-y-4">
              {[
                { label: 'PENDING_CONFIRMATION', title: 'Order Placed & WhatsApp Message Generated' },
                { label: 'ORDER_CONFIRMED', title: 'Order Confirmed by Store Owner' },
                { label: 'PAYMENT_CONFIRMED', title: 'Payment Confirmed' },
                { label: 'SHIPPED', title: 'Package Packed & Shipped' },
                { label: 'DELIVERED', title: 'Out for Delivery / Delivered' }
              ].map((step, idx) => {
                return (
                  <div key={idx} className="flex items-center space-x-3 text-xs">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{step.title}</p>
                      <p className="text-[10px] text-slate-500">{step.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs text-slate-300">
              <span className="font-bold text-white block mb-1">Delivery Address:</span>
              <p>{selectedOrder.delivery_address}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
