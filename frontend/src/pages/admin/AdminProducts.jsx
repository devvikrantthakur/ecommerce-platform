import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Trash2, Edit2, Plus, Loader, Image, ArrowUpDown } from 'lucide-react';

const AdminProducts = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filters
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCatId]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data && res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCatId) params.append('categoryId', selectedCatId);
      if (search) params.append('search', search);
      params.append('page', page);
      params.append('size', 5);
      params.append('sortBy', 'productName');
      params.append('direction', 'asc');

      const res = await api.get(`/products?${params.toString()}`);
      if (res.data && res.data.success) {
        setProducts(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName || !price || stock === '' || !categoryId) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        productName,
        productDescription,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        categoryId,
        imageUrl
      };

      let savedProduct;
      if (editingId) {
        // Update Product
        const res = await api.put(`/products/${editingId}`, payload);
        if (res.data && res.data.success) {
          showToast('Product updated successfully', 'success');
          savedProduct = res.data.data;
          setProducts(products.map(p => p.productId === editingId ? savedProduct : p));
        }
      } else {
        // Create Product
        const res = await api.post('/products', payload);
        if (res.data && res.data.success) {
          showToast('Product created successfully', 'success');
          savedProduct = res.data.data;
          setProducts([...products, savedProduct]);
        }
      }

      // If there is an image to upload, trigger upload
      if (imageFile && savedProduct) {
        await handleImageUpload(savedProduct.productId);
      }

      resetForm();
      fetchProducts(); // Refresh to catch changes
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (productId) => {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const res = await api.post(`/products/${productId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data && res.data.success) {
        showToast('Image uploaded successfully', 'success');
      }
    } catch (err) {
      showToast('Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (prod) => {
    setEditingId(prod.productId);
    setProductName(prod.productName);
    setProductDescription(prod.productDescription || '');
    setPrice(prod.price);
    setStock(prod.stock);
    setCategoryId(prod.categoryId);
    setImageUrl(prod.imageUrl || '');
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const res = await api.delete(`/products/${id}`);
        if (res.data && res.data.success) {
          showToast('Product soft-deleted successfully', 'success');
          setProducts(products.filter(p => p.productId !== id));
        }
      } catch (err) {
        showToast('Failed to delete product', 'error');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setProductName('');
    setProductDescription('');
    setPrice('');
    setStock('');
    setCategoryId('');
    setImageUrl('');
    setImageFile(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Product Catalog</h1>
          <p className="text-gray-500 text-xs mt-1">Manage warehouse stock lists.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center space-x-1 shadow"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Filters search and selector */}
      {!showForm && (
        <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl border shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 py-1.5 px-3 rounded-l-lg text-xs focus:outline-none"
            />
            <button type="submit" className="bg-indigo-600 text-white px-3 rounded-r-lg text-xs font-semibold">
              Search
            </button>
          </form>

          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="bg-gray-50 border border-gray-300 py-1.5 px-3 rounded-lg text-xs text-gray-700 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 max-w-xl">
          <h3 className="font-extrabold text-indigo-700 text-sm uppercase tracking-wider">
            {editingId ? 'Edit Product Details' : 'Add New Product'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Product Name*</label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="mt-1 w-full bg-white border border-gray-300 py-2 px-3 rounded-lg text-sm focus:outline-none"
                placeholder="Product title"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Category Allocation*</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full bg-white border border-gray-300 py-2 px-3 rounded-lg text-sm focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
            <textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full bg-white border border-gray-300 py-2 px-3 rounded-lg text-sm focus:outline-none"
              placeholder="Features list description details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Price ($)*</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full bg-white border border-gray-300 py-2 px-3 rounded-lg text-sm focus:outline-none"
                placeholder="9.99"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Initial Stock*</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="mt-1 w-full bg-white border border-gray-300 py-2 px-3 rounded-lg text-sm focus:outline-none"
                placeholder="50"
              />
            </div>
          </div>

          {/* Image files options */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Media</h4>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Direct Image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mt-1 w-full bg-white border border-gray-300 py-2 px-3 rounded-lg text-sm focus:outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Or Upload File (JPEG/PNG)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="mt-1 w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-2 text-xs font-bold border-t">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-500 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:bg-indigo-400 flex items-center space-x-1"
            >
              {(submitting || uploadingImage) && <Loader className="animate-spin" size={14} />}
              <span>Save Product</span>
            </button>
          </div>
        </form>
      )}

      {/* Product list catalog Table */}
      {!showForm && (
        <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y text-gray-700">
                {loading && products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8">
                      <Loader className="animate-spin text-indigo-600 mx-auto" size={24} />
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-400">
                      No products found. Add products to stock the warehouse catalog.
                    </td>
                  </tr>
                ) : (
                  products.map((prod) => (
                    <tr key={prod.productId} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3">
                        <div className="h-10 w-10 bg-gray-100 rounded border flex items-center justify-center overflow-hidden">
                          {prod.imageUrl ? (
                            <img src={prod.imageUrl} alt={prod.productName} className="object-cover h-full w-full" />
                          ) : (
                            <Image size={16} className="text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800 truncate max-w-[200px]" title={prod.productName}>
                        {prod.productName}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-indigo-600">
                        {prod.categoryName}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">${prod.price?.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          prod.stock > 10 
                            ? 'bg-emerald-50 text-emerald-800' 
                            : prod.stock > 0 
                            ? 'bg-amber-50 text-amber-800' 
                            : 'bg-rose-50 text-rose-800'
                        }`}>
                          {prod.stock === 0 ? 'Out of Stock' : `${prod.stock} units`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(prod)}
                            className="p-1.5 border rounded text-gray-500 hover:text-indigo-600 hover:bg-gray-50 transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.productId)}
                            className="p-1.5 border rounded text-gray-500 hover:text-red-600 hover:bg-gray-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 py-4 border-t bg-gray-55">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50 text-xs font-bold"
              >
                Prev
              </button>
              <span className="text-xs text-gray-500">Page {page + 1} of {totalPages}</span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50 text-xs font-bold"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
