import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, ShoppingCart, Eye } from 'lucide-react';

const Home = () => {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search state read from query params
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const page = parseInt(searchParams.get('page') || '0', 10);
  const size = parseInt(searchParams.get('size') || '8', 10);
  const sortBy = searchParams.get('sortBy') || 'productName';
  const direction = searchParams.get('direction') || 'asc';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data && res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (categoryId) params.append('categoryId', categoryId);
        if (search) params.append('search', search);
        params.append('page', page);
        params.append('size', size);
        params.append('sortBy', sortBy);
        params.append('direction', direction);

        const res = await api.get(`/products?${params.toString()}`);
        if (res.data && res.data.success) {
          setProducts(res.data.data.content);
          setTotalPages(res.data.data.totalPages);
          setTotalElements(res.data.data.totalElements);
        }
      } catch (err) {
        showToast('Error loading products', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId, search, page, size, sortBy, direction]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === undefined || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    // Reset page on filtering or sorting changes
    if (key !== 'page') {
      newParams.set('page', '0');
    }
    setSearchParams(newParams);
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please sign in to add items to cart', 'info');
      return;
    }

    const res = await addToCart(product.productId, 1);
    if (res.success) {
      showToast(`${product.productName} added to cart`, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amazon-lightBlue to-indigo-950 text-white rounded-2xl p-8 shadow-md relative overflow-hidden flex flex-col justify-center min-h-[160px]">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl font-extrabold md:text-4xl">Elevate Your Shopping</h1>
          <p className="mt-2 text-sm text-gray-300 md:text-base">Discover the ultimate inventory of products and daily deals built with top tier tech stacks.</p>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 bg-amazon-orange transform skew-x-12 translate-x-1/2 opacity-20 pointer-events-none"></div>
      </div>

      {/* Main Catalog Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Filters */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 h-fit space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-bold flex items-center space-x-2 text-gray-800">
              <SlidersHorizontal size={18} />
              <span>Filters</span>
            </h2>
            {(categoryId || search) && (
              <button 
                onClick={() => setSearchParams({})}
                className="text-xs font-semibold text-red-500 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Categories</h3>
            {categoryLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            ) : (
              <div className="space-y-1">
                <button
                  onClick={() => updateParam('categoryId', '')}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                    !categoryId ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.categoryId}
                    onClick={() => updateParam('categoryId', cat.categoryId)}
                    className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors truncate ${
                      categoryId === cat.categoryId ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort options */}
          <div className="border-t pt-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sort by</h3>
            <div className="relative">
              <select
                id="sort-select"
                value={`${sortBy}-${direction}`}
                onChange={(e) => {
                  const [field, dir] = e.target.value.split('-');
                  updateParam('sortBy', field);
                  updateParam('direction', dir);
                }}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="productName-asc">Alphabetical (A - Z)</option>
                <option value="productName-desc">Alphabetical (Z - A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="createdAt-desc">Newest Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Header information */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {loading ? (
                <span>Loading products...</span>
              ) : (
                <span>Showing <b>{products.length}</b> of <b>{totalElements}</b> products</span>
              )}
            </div>
          </div>

          {/* Catalog */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded w-full pt-4"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <Search className="text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-gray-800">No products found</h3>
              <p className="text-gray-500 text-sm mt-1">Try resetting filters or checking your search query.</p>
              <button 
                onClick={() => setSearchParams({})}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Show All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <div 
                  key={product.productId} 
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
                >
                  {/* Image wrapper */}
                  <div className="relative bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.productName} 
                        className="object-cover h-full w-full group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs font-semibold">No Image Available</span>
                    )}
                    {/* Hover actions overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                      <Link 
                        to={`/product/${product.productId}`}
                        className="bg-white text-gray-800 p-2.5 rounded-full hover:bg-indigo-600 hover:text-white shadow-md transition-colors"
                      >
                        <Eye size={18} />
                      </Link>
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {product.categoryName}
                      </span>
                      <h3 className="font-bold text-gray-800 mt-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {product.productName}
                      </h3>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                        {product.productDescription || 'No description provided.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        ${product.price?.toFixed(2)}
                      </span>
                      {product.stock > 0 ? (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          In Stock ({product.stock})
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart size={16} />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination controls */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6 border-t">
              <button
                onClick={() => updateParam('page', page - 1)}
                disabled={page === 0}
                className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateParam('page', i)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    page === i ? 'bg-indigo-600 text-white' : 'border hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => updateParam('page', page + 1)}
                disabled={page === totalPages - 1}
                className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Home;
