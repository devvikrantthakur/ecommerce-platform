import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Home } from 'lucide-react';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleQtyChange = async (item, newQty) => {
    if (newQty < 1) return;
    const res = await updateQuantity(item.cartItemId, newQty);
    if (!res.success) {
      showToast(res.message, 'error');
    }
  };

  const handleRemoveItem = async (item) => {
    const res = await removeFromCart(item.cartItemId);
    if (res.success) {
      showToast(`${item.productName} removed from cart`, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      const res = await clearCart();
      if (res.success) {
        showToast("Cart cleared", "success");
      }
    }
  };

  if (loading && !cart) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-6"></div>
        <div className="space-y-4">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="bg-indigo-50 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto text-indigo-600">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Your shopping cart is empty</h2>
        <p className="text-gray-500 text-sm">Add items to your cart from our list of categories to start shopping.</p>
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors shadow"
        >
          <Home size={16} />
          <span>Go to Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Shopping Cart</h1>
        <button 
          onClick={handleClearCart}
          className="text-xs font-semibold text-red-500 hover:underline flex items-center space-x-1"
        >
          <Trash2 size={14} />
          <span>Clear all items</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div 
              key={item.cartItemId} 
              className="bg-white rounded-xl border p-4 flex items-center space-x-4 shadow-sm"
            >
              {/* Product Thumbnail */}
              <div className="bg-gray-50 border rounded-lg h-20 w-20 flex items-center justify-center flex-shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.productName} className="object-cover h-full w-full rounded-lg" />
                ) : (
                  <span className="text-[10px] text-gray-400 text-center font-medium">No Image</span>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-grow min-w-0">
                <h3 className="font-bold text-gray-800 text-sm truncate hover:text-indigo-600 transition-colors">
                  <Link to={`/product/${item.productId}`}>{item.productName}</Link>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Unit Price: ${item.price?.toFixed(2)}</p>
                <div className="mt-2 flex items-center justify-between">
                  {/* Quantity selector */}
                  <div className="flex items-center border rounded bg-gray-50 overflow-hidden">
                    <button
                      onClick={() => handleQtyChange(item, item.quantity - 1)}
                      className="p-1 hover:bg-gray-200 transition-colors text-gray-600"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-xs font-bold text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => handleQtyChange(item, item.quantity + 1)}
                      className="p-1 hover:bg-gray-200 transition-colors text-gray-600"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {/* Delete button */}
                  <button 
                    onClick={() => handleRemoveItem(item)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="text-right flex-shrink-0 pl-2">
                <span className="font-bold text-gray-950 text-sm">${item.subTotal?.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="bg-white p-6 rounded-xl border shadow-sm h-fit space-y-6">
          <h2 className="font-extrabold text-gray-900 border-b pb-3 text-sm uppercase tracking-wider">Order Summary</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping Cost</span>
              <span className="text-emerald-600 font-semibold">{totalAmount >= 50 ? 'FREE' : '$5.00'}</span>
            </div>
            <hr className="border-gray-100" />
            <div className="flex justify-between text-base font-extrabold text-gray-900">
              <span>Total Price</span>
              <span>${(totalAmount >= 50 ? totalAmount : totalAmount + 5).toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors shadow flex items-center justify-center space-x-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </button>
          
          <div className="text-center">
            <Link to="/" className="text-xs text-gray-500 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
