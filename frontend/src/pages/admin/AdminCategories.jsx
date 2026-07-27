import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Trash2, Edit2, Plus, Loader, Tags } from 'lucide-react';

const AdminCategories = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      if (res.data && res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      showToast('Category name is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Update Category
        const res = await api.put(`/categories/${editingId}`, { name, description });
        if (res.data && res.data.success) {
          showToast('Category updated successfully', 'success');
          setCategories(categories.map(c => c.categoryId === editingId ? res.data.data : c));
          resetForm();
        }
      } else {
        // Create Category
        const res = await api.post('/categories', { name, description });
        if (res.data && res.data.success) {
          showToast('Category created successfully', 'success');
          setCategories([...categories, res.data.data]);
          resetForm();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.categoryId);
    setName(cat.name);
    setDescription(cat.description || '');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category? (Soft deletes from product catalog views).")) {
      try {
        const res = await api.delete(`/categories/${id}`);
        if (res.data && res.data.success) {
          showToast('Category deleted successfully', 'success');
          setCategories(categories.filter(c => c.categoryId !== id));
        }
      } catch (err) {
        showToast('Failed to delete category', 'error');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setShowForm(false);
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Category Catalog</h1>
          <p className="text-gray-500 text-xs mt-1">Manage product catalog classifications.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center space-x-1 shadow"
          >
            <Plus size={16} />
            <span>Create Category</span>
          </button>
        )}
      </div>

      {/* Form inline */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 max-w-xl">
          <h3 className="font-extrabold text-indigo-700 text-sm uppercase tracking-wider">
            {editingId ? 'Edit Category Details' : 'Create New Category'}
          </h3>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Category Name*</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full bg-white border border-gray-300 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Electronics, Home, Fashion etc."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full bg-white border border-gray-300 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Short description details..."
            />
          </div>

          <div className="flex space-x-2 pt-2 text-xs font-bold">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-500 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:bg-indigo-400 flex items-center space-x-1"
            >
              {submitting && <Loader className="animate-spin" size={14} />}
              <span>Save Category</span>
            </button>
          </div>
        </form>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-xs font-bold text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Category Name</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y text-gray-700">
            {categories.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Tags className="text-gray-300" size={32} />
                    <p className="font-semibold">No categories registered yet.</p>
                  </div>
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.categoryId} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-bold text-gray-800">{cat.name}</td>
                  <td className="px-6 py-4 text-xs max-w-sm truncate text-gray-500">
                    {cat.description || 'No description.'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 border rounded text-gray-500 hover:text-indigo-600 hover:bg-gray-50 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.categoryId)}
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
    </div>
  );
};

export default AdminCategories;
