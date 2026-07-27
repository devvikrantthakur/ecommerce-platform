import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Users, Package, Tags, ShoppingCart, DollarSign, Loader, TrendingUp, Sparkles } from 'lucide-react';

const AdminDashboard = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data && res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        showToast('Failed to load dashboard metrics', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats?.revenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-600',
      description: 'Gross sales volume'
    },
    {
      title: 'Placed Orders',
      value: stats?.totalOrders || '0',
      icon: ShoppingCart,
      color: 'from-indigo-500 to-blue-600',
      description: 'Customer transactions count'
    },
    {
      title: 'Registered Users',
      value: stats?.totalUsers || '0',
      icon: Users,
      color: 'from-amber-500 to-orange-600',
      description: 'Active & Blocked users'
    },
    {
      title: 'Products Listed',
      value: stats?.totalProducts || '0',
      icon: Package,
      color: 'from-pink-500 to-rose-600',
      description: 'Active inventory catalog'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 text-xs mt-1">Real-time statistics of NexShop services.</p>
        </div>
        <span className="flex items-center space-x-1 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-lg">
          <Sparkles size={14} />
          <span>System Healthy</span>
        </span>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.title} 
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center space-x-4 transition-all hover:shadow-md"
            >
              <div className={`p-3.5 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-inner`}>
                <Icon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.title}</h2>
                <p className="text-2xl font-black text-gray-900 mt-1 tracking-tight">{card.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Mock charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales charts */}
        <div className="bg-white rounded-2xl border p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center space-x-1">
              <TrendingUp size={16} className="text-indigo-600" />
              <span>Sales & Growth Analytics</span>
            </h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
              +14% Monthly
            </span>
          </div>

          {/* Simple Mock histogram using flex */}
          <div className="flex items-end justify-between h-48 pt-6 px-4">
            {[45, 60, 52, 70, 85, 65, 95, 110, 130].map((h, i) => (
              <div key={i} className="flex flex-col items-center w-full max-w-[28px] group">
                <div 
                  className="bg-indigo-600 group-hover:bg-indigo-500 rounded-t w-full transition-all duration-500 relative"
                  style={{ height: `${h}px` }}
                >
                  {/* Tooltip on hover */}
                  <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    ${(h * 125).toLocaleString()}
                  </span>
                </div>
                <span className="text-[9px] text-gray-400 font-semibold mt-2">
                  {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center space-x-1">
              <Tags size={16} className="text-indigo-600" />
              <span>Inventory Allocations</span>
            </h3>
          </div>

          {/* List of allocations */}
          <div className="space-y-4 pt-2">
            {[
              { name: 'Electronics', percentage: 40, color: 'bg-indigo-600' },
              { name: 'Fashion & Apparel', percentage: 30, color: 'bg-emerald-500' },
              { name: 'Home Goods', percentage: 20, color: 'bg-amber-500' },
              { name: 'Other Items', percentage: 10, color: 'bg-rose-500' }
            ].map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-gray-600">
                  <span>{cat.name}</span>
                  <span>{cat.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
