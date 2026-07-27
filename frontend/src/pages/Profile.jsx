import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Lock, MapPin, Trash2, Edit2, Plus, Loader, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateProfileState } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form States
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  // Address CRUD States
  const [addresses, setAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState(null);
  
  // Address Form States
  const [addressDetails, setAddressDetails] = useState('');
  const [addressType, setAddressType] = useState('HOME');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [addrSubmitting, setAddrSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setMobileNumber(user.mobileNumber || '');
    }
  }, [user]);

  // Load Addresses on active tab addresses
  useEffect(() => {
    if (activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [activeTab]);

  const fetchAddresses = async () => {
    setAddrLoading(true);
    try {
      const res = await api.get('/addresses');
      if (res.data && res.data.success) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      showToast('Failed to fetch addresses', 'error');
    } finally {
      setAddrLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      showToast('First and Last names are required', 'error');
      return;
    }

    setProfileSubmitting(true);
    try {
      const res = await api.put('/users/profile', { firstName, lastName, mobileNumber });
      if (res.data && res.data.success) {
        showToast('Profile updated successfully', 'success');
        updateProfileState(res.data.data);
      }
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('All fields are required', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setPwdSubmitting(true);
    try {
      const res = await api.post('/users/profile/change-password', { currentPassword, newPassword });
      if (res.data && res.data.success) {
        showToast('Password updated successfully', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Password update failed';
      showToast(msg, 'error');
    } finally {
      setPwdSubmitting(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressDetails || !city || !state || !pincode) {
      showToast('Please fill out all address fields', 'error');
      return;
    }

    setAddrSubmitting(true);
    try {
      if (editingAddrId) {
        // Update Address
        const res = await api.put(`/addresses/${editingAddrId}`, { addressDetails, addressType, city, state, pincode });
        if (res.data && res.data.success) {
          showToast('Address updated successfully', 'success');
          setAddresses(addresses.map(a => a.addressId === editingAddrId ? res.data.data : a));
          resetAddressForm();
        }
      } else {
        // Add Address
        const res = await api.post('/addresses', { addressDetails, addressType, city, state, pincode });
        if (res.data && res.data.success) {
          showToast('Address added successfully', 'success');
          setAddresses([...addresses, res.data.data]);
          resetAddressForm();
        }
      }
    } catch (err) {
      showToast('Failed to save address', 'error');
    } finally {
      setAddrSubmitting(false);
    }
  };

  const handleEditAddress = (addr) => {
    setEditingAddrId(addr.addressId);
    setAddressDetails(addr.addressDetails);
    setAddressType(addr.addressType);
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setShowAddrForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        const res = await api.delete(`/addresses/${addressId}`);
        if (res.data && res.data.success) {
          showToast('Address deleted successfully', 'success');
          setAddresses(addresses.filter(a => a.addressId !== addressId));
        }
      } catch (err) {
        showToast('Failed to delete address', 'error');
      }
    }
  };

  const resetAddressForm = () => {
    setEditingAddrId(null);
    setAddressDetails('');
    setAddressType('HOME');
    setCity('');
    setState('');
    setPincode('');
    setShowAddrForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Account</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Navigation Tabs */}
        <div className="bg-white p-3 rounded-xl border shadow-sm h-fit space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2 ${
              activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <User size={18} />
            <span>Profile Details</span>
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2 ${
              activeTab === 'addresses' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <MapPin size={18} />
            <span>Addresses</span>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2 ${
              activeTab === 'password' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Lock size={18} />
            <span>Change Password</span>
          </button>
        </div>

        {/* Action Panel Content */}
        <div className="md:col-span-3">
          
          {/* Tab 1: Profile View */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-3">Edit Profile Information</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1 w-full bg-white border border-gray-300 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1 w-full bg-white border border-gray-300 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Email Address (Cannot change)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="mt-1 w-full bg-gray-50 border border-gray-200 text-gray-400 py-2 px-3 rounded-lg text-sm cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Mobile Number</label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="mt-1 w-full bg-white border border-gray-300 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="9999999999"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={profileSubmitting}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors shadow flex items-center space-x-2 disabled:bg-indigo-400"
                  >
                    {profileSubmitting && <Loader className="animate-spin" size={16} />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: Addresses Management */}
          {activeTab === 'addresses' && (
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-lg font-bold text-gray-900">Manage Delivery Addresses</h2>
                {!showAddrForm && (
                  <button
                    onClick={() => setShowAddrForm(true)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 border border-indigo-100"
                  >
                    <Plus size={14} />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {/* Form Add/Edit */}
              {showAddrForm && (
                <form onSubmit={handleSaveAddress} className="bg-gray-50 p-4 rounded-xl border space-y-3">
                  <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    {editingAddrId ? 'Edit Address Details' : 'Add New Address'}
                  </h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Address Type</label>
                      <select
                        value={addressType}
                        onChange={(e) => setAddressType(e.target.value)}
                        className="mt-1 w-full bg-white border border-gray-300 py-1.5 px-3 rounded text-sm"
                      >
                        <option value="HOME">Home</option>
                        <option value="OFFICE">Office</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Pincode</label>
                      <input
                        type="text"
                        required
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="mt-1 w-full bg-white border border-gray-300 py-1 px-3 rounded text-sm"
                        placeholder="560001"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Address Details</label>
                    <textarea
                      required
                      value={addressDetails}
                      onChange={(e) => setAddressDetails(e.target.value)}
                      rows={2}
                      className="mt-1 w-full bg-white border border-gray-300 py-1 px-3 rounded text-sm"
                      placeholder="Flat, Apartment name, Road name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">City</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-1 w-full bg-white border border-gray-300 py-1 px-3 rounded text-sm"
                        placeholder="Bengaluru"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">State</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="mt-1 w-full bg-white border border-gray-300 py-1 px-3 rounded text-sm"
                        placeholder="Karnataka"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2 justify-end text-xs font-semibold">
                    <button
                      type="button"
                      onClick={resetAddressForm}
                      className="px-3 py-1.5 text-gray-500 border rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addrSubmitting}
                      className="px-4 py-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded disabled:bg-indigo-400"
                    >
                      {addrSubmitting ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              )}

              {/* Saved list */}
              {addrLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : addresses.length === 0 ? (
                <p className="text-gray-500 text-sm">No delivery addresses found. Add one to complete checkout easily.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.addressId} className="p-4 rounded-xl border bg-gray-50 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded uppercase">
                            {addr.addressType}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditAddress(addr)}
                              className="text-gray-400 hover:text-indigo-600 transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.addressId)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-700 text-xs mt-3 leading-relaxed">{addr.addressDetails}</p>
                      </div>
                      <p className="text-gray-500 text-[10px] mt-2 border-t pt-2">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Security Password updates */}
          {activeTab === 'password' && (
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-3">Update Account Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 w-full bg-white border border-gray-300 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 w-full bg-white border border-gray-300 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full bg-white border border-gray-300 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={pwdSubmitting}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors shadow flex items-center space-x-2 disabled:bg-indigo-400"
                  >
                    {pwdSubmitting && <Loader className="animate-spin" size={16} />}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
