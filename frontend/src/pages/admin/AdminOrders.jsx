import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ShoppingBag, Eye, Loader, Search, RefreshCw, XCircle } from 'lucide-react';

const AdminOrders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter/Search states
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Inspector modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page);
      params.append('size', 6);
      params.append('sortBy', 'orderDate');
      params.append('direction', 'desc');

      const res = await api.get(`/orders/admin?${params.toString()}`);
      if (res.data && res.data.success) {
        setOrders(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      showToast('Failed to load system orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchOrders();
  };

  const handleInspect = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      if (res.data && res.data.success) {
        setSelectedOrder(res.data.data);
        setModalOpen(true);
      }
    } catch (err) {
      showToast('Failed to retrieve order details', 'error');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await api.patch(`/orders/${orderId}/status?status=${newStatus}`);
      if (res.data && res.data.success) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        setOrders(orders.map(o => o.orderId === orderId ? res.data.data : o));
        if (selectedOrder && selectedOrder.orderId === orderId) {
          setSelectedOrder(res.data.data);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PACKED': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Order Fulfilment</h1>
          <p className="text-gray-500 text-xs mt-1">Review checkout carts and track logistics.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl border shadow-sm items-center">
        <form onSubmit={handleSearchSubmit} className="flex flex-grow max-w-sm">
          <input
            type="text"
            placeholder="Search email or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 py-1.5 px-3 rounded-l-lg text-xs focus:outline-none"
          />
          <button type="submit" className="bg-indigo-600 text-white px-3 rounded-r-lg text-xs font-semibold">
            Search
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="bg-gray-50 border border-gray-300 py-1.5 px-3 rounded-lg text-xs text-gray-700 focus:outline-none font-semibold"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PACKED">Packed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer Email</th>
                <th className="px-6 py-4">Order Date</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Tracking Status</th>
                <th className="px-6 py-4 text-right">Fulfillment Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y text-gray-700">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <Loader className="animate-spin text-indigo-600 mx-auto" size={24} />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400">
                    No orders matching filters found in logs.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-500 truncate max-w-[120px]" title={order.orderId}>
                      {order.orderId}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{order.userEmail}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(order.orderDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">${order.paymentAmount?.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusColor(order.orderStatusName)}`}>
                        {order.orderStatusName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={() => handleInspect(order.orderId)}
                          className="p-1.5 border rounded text-gray-500 hover:text-indigo-600 hover:bg-gray-50 transition-colors"
                          title="Inspect Order"
                        >
                          <Eye size={14} />
                        </button>
                        
                        {/* Status update quick selects */}
                        {order.orderStatusName !== 'DELIVERED' && order.orderStatusName !== 'CANCELLED' && (
                          <select
                            disabled={updatingId === order.orderId}
                            onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                            value={order.orderStatusName}
                            className="bg-gray-50 border border-gray-300 py-1 px-2 rounded text-xs focus:outline-none"
                          >
                            <option value="PENDING" disabled>Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PACKED">Packed</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancel</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 py-4 border-t bg-gray-50">
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

      {/* Inspector Details Modal */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>

            <div className="border-b pb-3">
              <h2 className="text-lg font-extrabold text-gray-900">Admin Fulfilment Details</h2>
              <p className="text-xs text-gray-500 mt-1">ID: {selectedOrder.orderId}</p>
            </div>

            {/* List items */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Items</h3>
              <div className="border rounded-xl divide-y overflow-hidden max-h-40 overflow-y-auto">
                {selectedOrder.items.map((item) => (
                  <div key={item.orderItemId} className="p-3 flex items-center justify-between text-xs bg-white hover:bg-gray-50">
                    <div>
                      <h4 className="font-bold text-gray-800">{item.productName}</h4>
                      <p className="text-gray-500 mt-0.5">${item.price?.toFixed(2)} x {item.quantity}</p>
                    </div>
                    <span className="font-bold text-gray-900">${item.subTotal?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Logistics Status Controls */}
            <div className="bg-gray-50 p-4 rounded-xl border space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Logistics Transition</span>
              <div className="flex flex-wrap items-center gap-2">
                {['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => {
                  const isActive = selectedOrder.orderStatusName === s;
                  return (
                    <button
                      key={s}
                      disabled={isActive || selectedOrder.orderStatusName === 'DELIVERED' || selectedOrder.orderStatusName === 'CANCELLED'}
                      onClick={() => handleStatusChange(selectedOrder.orderId, s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        isActive
                          ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200 disabled:opacity-40 disabled:hover:bg-white'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Metadata Info */}
            <div className="grid grid-cols-2 gap-4 text-xs border-t pt-4">
              <div>
                <span className="text-gray-400 font-semibold block">Customer Details</span>
                <span className="font-bold text-gray-800 mt-1 block">{selectedOrder.userEmail}</span>
                <span className="text-gray-500 text-[10px]">Method: {selectedOrder.paymentMode}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 font-semibold block">Financials</span>
                <span className="font-black text-sm text-gray-900 mt-1 block">Total: ${selectedOrder.paymentAmount?.toFixed(2)}</span>
                <span className="text-gray-500 text-[10px]">Status: {selectedOrder.paymentStatus}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
