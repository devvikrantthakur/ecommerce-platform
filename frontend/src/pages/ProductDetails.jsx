import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ChevronLeft, ShoppingCart, ShieldCheck, Truck, RefreshCw, Plus, Minus } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data && res.data.success) {
          setProduct(res.data.data);
        }
      } catch (err) {
        showToast('Product not found', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please sign in to add items to cart', 'info');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    const res = await addToCart(product.productId, quantity);
    setSubmitting(false);

    if (res.success) {
      showToast(`${quantity}x ${product.productName} added to cart`, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-200 h-96 rounded-xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Back Link */}
      <Link to="/" className="inline-flex items-center space-x-1 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors">
        <ChevronLeft size={16} />
        <span>Back to products</span>
      </Link>

      {/* Detail Layout */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
        {/* Left Column: Image */}
        <div className="bg-gray-50 rounded-xl border flex items-center justify-center p-4 min-h-[300px] md:h-[450px]">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.productName} 
              className="object-contain max-h-full max-w-full rounded-lg"
            />
          ) : (
            <span className="text-gray-400 font-semibold">No Image Available</span>
          )}
        </div>

        {/* Right Column: Information */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category label */}
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {product.categoryName}
            </span>

            {/* Title */}
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {product.productName}
            </h1>

            {/* Price & Stock info */}
            <div className="flex items-center justify-between py-2 border-y border-gray-100">
              <span className="text-3xl font-black text-gray-900">
                ${product.price?.toFixed(2)}
              </span>
              <div>
                {product.stock > 0 ? (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full">
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-50 text-red-800 text-xs font-bold rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Description</h3>
              <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                {product.productDescription || 'No description available for this product.'}
              </p>
            </div>
          </div>

          {/* Add to Cart Actions */}
          {product.stock > 0 && (
            <div className="bg-gray-50 p-4 rounded-xl border space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">Select Quantity</span>
                <div className="flex items-center border rounded-lg bg-white overflow-hidden shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 text-sm font-bold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={submitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors shadow flex items-center justify-center space-x-2"
              >
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </button>
            </div>
          )}

          {/* Core values guarantees */}
          <div className="grid grid-cols-3 gap-4 pt-4 text-center border-t text-[10px] text-gray-500">
            <div className="flex flex-col items-center space-y-1">
              <Truck className="text-indigo-600" size={18} />
              <span className="font-semibold text-gray-700">Free Shipping</span>
              <span>On orders over $50</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <RefreshCw className="text-indigo-600" size={18} />
              <span className="font-semibold text-gray-700">Easy Returns</span>
              <span>10-day return policy</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <ShieldCheck className="text-indigo-600" size={18} />
              <span className="font-semibold text-gray-700">Secure Checkout</span>
              <span>100% encrypted checks</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
