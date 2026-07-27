import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { ShoppingBag, ChevronRight, Eye, Calendar, DollarSign, XCircle, Clock } from 'lucide-react';

const Orders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Pagination states
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/history?page=${page}&size=5&sortBy=orderDate&direction=desc`);
      if (res.data && res.data.success) {
        setOrders(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      showToast('Failed to load order history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const handleViewDetails = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      if (res.data && res.data.success) {
        setSelectedOrder(res.data.data);
        setModalOpen(true);
      }
    } catch (err) {
      showToast('Failed to fetch order details', 'error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order? It will restock items back into inventory.")) {
      setCancelling(true);
      try {
        // Cancel order using status update endpoint
        const res = await api.patch(`/orders/${orderId}/status?status=CANCELLED`);
        if (res.data && res.data.success) {
          showToast('Order cancelled successfully', 'success');
          // Refresh list
          fetchOrders();
          // Update selected modal view if open
          if (selectedOrder && selectedOrder.orderId === orderId) {
            setSelectedOrder(res.data.data);
          }
        }
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
      } finally {
        setCancelling(false);
      }
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

  // Status Milestones Timeline Helper
  const getTimelineStep = (status) => {
    const steps = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];
    return steps.indexOf(status);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Order History</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <ShoppingBag className="text-gray-300 mb-4 animate-bounce" size={48} />
          <h3 className="text-lg font-bold text-gray-800">No orders placed yet</h3>
          <p className="text-gray-500 text-sm mt-1">Explore our product catalogs and place your first order.</p>
          <a href="/" className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors">
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div 
              key={order.orderId}
              className="bg-white border rounded-xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <div className="flex items-center space-x-3">
                  <span className="p-2 bg-gray-50 border rounded-lg text-gray-500">
                    <ShoppingBag size={20} />
                  </span>
                  <div>
                    <h3 className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order ID</h3>
                    <p className="text-xs font-bold text-gray-800 truncate max-w-[150px] sm:max-w-xs">{order.orderId}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusColor(order.orderStatusName)}`}>
                    {order.orderStatusName}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 font-semibold flex items-center space-x-1">
                    <Calendar size={14} className="text-gray-400" />
                    <span>Order Date</span>
                  </span>
                  <p className="font-bold text-gray-800 mt-1">{new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold flex items-center space-x-1">
                    <DollarSign size={14} className="text-gray-400" />
                    <span>Total Cost</span>
                  </span>
                  <p className="font-bold text-gray-950 mt-1">${order.paymentAmount?.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold flex items-center space-x-1">
                    <Clock size={14} className="text-gray-400" />
                    <span>Payment Mode</span>
                  </span>
                  <p className="font-bold text-gray-800 mt-1">{order.paymentMode}</p>
                </div>
                <div className="flex items-center justify-end space-x-2 col-span-2 sm:col-span-1">
                  <button
                    onClick={() => handleViewDetails(order.orderId)}
                    className="px-3.5 py-1.5 border hover:bg-gray-50 text-gray-700 font-bold rounded-lg text-xs flex items-center space-x-1 transition-colors"
                  >
                    <Eye size={14} />
                    <span>Inspect</span>
                  </button>
                  {/* Allow Cancel if PENDING or CONFIRMED */}
                  {('PENDING' === order.orderStatusName || 'CONFIRMED' === order.orderStatusName) && (
                    <button
                      onClick={() => handleCancelOrder(order.orderId)}
                      disabled={cancelling}
                      className="px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-lg text-xs flex items-center space-x-1 transition-colors border border-rose-200"
                    >
                      <XCircle size={14} />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-4">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 border rounded disabled:opacity-40 hover:bg-gray-100"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-gray-600">Page {page + 1} of {totalPages}</span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
                className="px-3 py-1.5 border rounded disabled:opacity-40 hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
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
              <h2 className="text-lg font-extrabold text-gray-900">Order Detail Inspection</h2>
              <p className="text-xs text-gray-500 mt-1">ID: {selectedOrder.orderId}</p>
            </div>

            {/* Timeline for order tracking (not shown if CANCELLED) */}
            {selectedOrder.orderStatusName !== 'CANCELLED' ? (
              <div className="bg-gray-50 p-4 rounded-xl border">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Delivery Progress</h3>
                
                {/* 5 stage stepper */}
                <div className="relative flex items-center justify-between w-full">
                  {/* Line connection */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2 z-0"></div>
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-emerald-500 transform -translate-y-1/2 z-0 transition-all duration-500"
                    style={{ width: `${(getTimelineStep(selectedOrder.orderStatusName) / 4) * 100}%` }}
                  ></div>

                  {['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'].map((step, idx) => {
                    const currentIdx = getTimelineStep(selectedOrder.orderStatusName);
                    const isCompleted = idx <= currentIdx;
                    const isActive = idx === currentIdx;

                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                            : 'bg-white border-gray-300 text-gray-400'
                        } ${isActive ? 'ring-4 ring-emerald-100' : ''}`}>
                          {idx + 1}
                        </div>
                        <span className={`text-[10px] mt-1 font-semibold ${
                          isCompleted ? 'text-emerald-700' : 'text-gray-400'
                        }`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-3 text-rose-800 text-xs">
                <XCircle size={18} />
                <span className="font-semibold">This order has been cancelled and its inventory items have been restocked.</span>
              </div>
            )}

            {/* Placed Items list */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Items Placed</h3>
              <div className="border rounded-xl divide-y overflow-hidden max-h-48 overflow-y-auto">
                {selectedOrder.items.map((item) => (
                  <div key={item.orderItemId} className="p-3 flex items-center justify-between text-xs bg-white hover:bg-gray-50">
                    <div>
                      <h4 className="font-bold text-gray-800 truncate max-w-[200px]">{item.productName}</h4>
                      <p className="text-gray-500 mt-0.5">${item.price?.toFixed(2)} x {item.quantity}</p>
                    </div>
                    <span className="font-bold text-gray-900">${item.subTotal?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing details */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4 text-xs">
              <div>
                <span className="text-gray-400 font-semibold block">Delivery Status</span>
                <span className={`inline-block font-bold mt-1 px-2.5 py-0.5 rounded border ${getStatusColor(selectedOrder.orderStatusName)}`}>
                  {selectedOrder.orderStatusName}
                </span>
                <p className="text-gray-500 text-[10px] mt-1">{selectedOrder.orderStatusDescription}</p>
              </div>
              <div className="text-right space-y-1">
                <div className="flex justify-between pl-12 text-gray-500">
                  <span>Method</span>
                  <span className="font-semibold">{selectedOrder.paymentMode}</span>
                </div>
                <div className="flex justify-between pl-12 text-gray-500">
                  <span>Tx status</span>
                  <span className={`font-semibold ${
                    selectedOrder.paymentStatus === 'SUCCESS' ? 'text-emerald-600' : selectedOrder.paymentStatus === 'FAILED' ? 'text-rose-600' : 'text-amber-600'
                  }`}>{selectedOrder.paymentStatus}</span>
                </div>
                <div className="flex justify-between pl-12 font-extrabold text-sm text-gray-900 border-t pt-1">
                  <span>Total cost</span>
                  <span>${selectedOrder.paymentAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
