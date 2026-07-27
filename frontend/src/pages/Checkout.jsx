import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { MapPin, Plus, Loader, ChevronRight, CheckCircle, CreditCard, Wallet, Banknote } from 'lucide-react';

const Checkout = () => {
  const { cart, clearCart, refreshCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMode, setPaymentMode] = useState('COD');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Address creation form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressDetails, setAddressDetails] = useState('');
  const [addressType, setAddressType] = useState('HOME');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      showToast('Please add items to cart before checking out', 'info');
      navigate('/cart');
      return;
    }
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      if (res.data && res.data.success) {
        setAddresses(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedAddressId(res.data.data[0].addressId);
        }
      }
    } catch (err) {
      showToast('Failed to fetch addresses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addressDetails || !city || !state || !pincode) {
      showToast('Please fill out all address fields', 'error');
      return;
    }

    setAddressSubmitting(true);
    try {
      const res = await api.post('/addresses', {
        addressDetails,
        addressType,
        city,
        state,
        pincode
      });
      if (res.data && res.data.success) {
        showToast('Address added successfully', 'success');
        setAddresses([...addresses, res.data.data]);
        setSelectedAddressId(res.data.data.addressId);
        
        // Reset form
        setAddressDetails('');
        setCity('');
        setState('');
        setPincode('');
        setShowAddressForm(false);
      }
    } catch (err) {
      showToast('Failed to save address', 'error');
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showToast('Please select a delivery address', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/orders/checkout', {
        addressId: selectedAddressId,
        paymentMode
      });
      if (res.data && res.data.success) {
        showToast('Order placed successfully!', 'success');
        // Clear cart local state
        await clearCart();
        // Redirect to orders page
        navigate('/orders');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const subTotal = cart?.totalAmount || 0;
  const shipping = subTotal >= 50 ? 0 : 5;
  const total = subTotal + shipping;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Checkout Forms Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Address Selection */}
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-base font-bold text-gray-800 flex items-center space-x-2">
                <span className="bg-indigo-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">1</span>
                <span>Shipping Address</span>
              </h2>
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-xs font-semibold text-indigo-600 hover:underline flex items-center space-x-1"
                >
                  <Plus size={14} />
                  <span>Add Address</span>
                </button>
              )}
            </div>

            {/* Form Inline */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="bg-gray-50 p-4 rounded-lg border space-y-3">
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
                    placeholder="Apartment, Street name, Area"
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

                <div className="flex space-x-2 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-500 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addressSubmitting}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded disabled:bg-indigo-400"
                  >
                    {addressSubmitting ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            )}

            {/* List addresses saved */}
            {addresses.length === 0 ? (
              <p className="text-gray-500 text-sm">No saved addresses found. Please add a new address to proceed.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.addressId}
                    onClick={() => setSelectedAddressId(addr.addressId)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedAddressId === addr.addressId
                        ? 'border-indigo-600 bg-indigo-50/55'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                        {addr.addressType}
                      </span>
                      {selectedAddressId === addr.addressId && (
                        <CheckCircle size={16} className="text-indigo-600" />
                      )}
                    </div>
                    <p className="text-gray-700 text-sm mt-2 leading-relaxed">{addr.addressDetails}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Payment Mode */}
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-800 flex items-center space-x-2 border-b pb-3">
              <span className="bg-indigo-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">2</span>
              <span>Payment Method</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* COD */}
              <div
                onClick={() => setPaymentMode('COD')}
                className={`p-4 rounded-lg border cursor-pointer flex flex-col items-center justify-center space-y-2 text-center transition-all ${
                  paymentMode === 'COD' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Banknote size={24} className={paymentMode === 'COD' ? 'text-indigo-600' : 'text-gray-500'} />
                <span className="text-xs font-bold text-gray-700">COD</span>
                <span className="text-[10px] text-gray-400">Cash on Delivery</span>
              </div>

              {/* CARD */}
              <div
                onClick={() => setPaymentMode('CARD')}
                className={`p-4 rounded-lg border cursor-pointer flex flex-col items-center justify-center space-y-2 text-center transition-all ${
                  paymentMode === 'CARD' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard size={24} className={paymentMode === 'CARD' ? 'text-indigo-600' : 'text-gray-500'} />
                <span className="text-xs font-bold text-gray-700">CARD</span>
                <span className="text-[10px] text-gray-400">Credit/Debit Cards</span>
              </div>

              {/* UPI */}
              <div
                onClick={() => setPaymentMode('UPI')}
                className={`p-4 rounded-lg border cursor-pointer flex flex-col items-center justify-center space-y-2 text-center transition-all ${
                  paymentMode === 'UPI' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Wallet size={24} className={paymentMode === 'UPI' ? 'text-indigo-600' : 'text-gray-500'} />
                <span className="text-xs font-bold text-gray-700">UPI</span>
                <span className="text-[10px] text-gray-400">GooglePay/PhonePe</span>
              </div>

              {/* CASH */}
              <div
                onClick={() => setPaymentMode('CASH')}
                className={`p-4 rounded-lg border cursor-pointer flex flex-col items-center justify-center space-y-2 text-center transition-all ${
                  paymentMode === 'CASH' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Banknote size={24} className={paymentMode === 'CASH' ? 'text-indigo-600' : 'text-gray-500'} />
                <span className="text-xs font-bold text-gray-700">CASH</span>
                <span className="text-[10px] text-gray-400">Pay Counter Cash</span>
              </div>
            </div>
          </div>

        </div>

        {/* Step 3: Summary Sidebar */}
        <div className="bg-white p-6 rounded-xl border shadow-sm h-fit space-y-6">
          <h2 className="font-extrabold text-gray-900 border-b pb-3 text-sm uppercase tracking-wider">Checkout Summary</h2>

          {/* Cart review */}
          <div className="max-h-48 overflow-y-auto space-y-3">
            {cart.items.map((item) => (
              <div key={item.cartItemId} className="flex justify-between items-center text-xs">
                <span className="text-gray-600 truncate max-w-[150px]">{item.productName}</span>
                <span className="text-gray-500 font-medium">x{item.quantity}</span>
                <span className="font-bold text-gray-800">${item.subTotal?.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <hr className="border-gray-100" />

          {/* Pricing breakdowns */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Cart items cost</span>
              <span>${subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Fulfillment Charge</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Payment Option</span>
              <span className="font-semibold text-indigo-600">{paymentMode}</span>
            </div>
            <hr className="border-gray-100" />
            <div className="flex justify-between text-base font-extrabold text-gray-900">
              <span>Grand Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={submitting || addresses.length === 0}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors shadow flex items-center justify-center space-x-2 disabled:bg-gray-200 disabled:text-gray-400"
          >
            {submitting ? (
              <>
                <Loader className="animate-spin -ml-1 mr-2" size={16} />
                <span>Processing Order...</span>
              </>
            ) : (
              <span>Confirm & Place Order</span>
            )}
          </button>

          <div className="text-center">
            <Link to="/cart" className="text-xs text-gray-500 hover:underline">
              Back to shopping cart
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
