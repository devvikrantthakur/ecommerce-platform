import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Tags, Package, Users, ShoppingBag } from 'lucide-react';

const Sidebar = () => {
  const activeClass = "flex items-center space-x-3 px-4 py-3 rounded-lg bg-indigo-50 text-indigo-700 font-semibold transition-colors duration-150";
  const inactiveClass = "flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium transition-colors duration-150";

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-16 flex flex-col p-4 shadow-sm">
      <div className="mb-6 px-2">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Admin Management
        </h2>
      </div>

      <nav className="flex-1 space-y-1">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/categories"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <Tags size={20} />
          <span>Categories</span>
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <Package size={20} />
          <span>Products</span>
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <ShoppingBag size={20} />
          <span>Orders</span>
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
        >
          <Users size={20} />
          <span>Users</span>
        </NavLink>
      </nav>
      
      <div className="mt-auto border-t border-gray-200 pt-4 px-2">
        <div className="text-xs text-gray-400">
          <p>Logged in as</p>
          <p className="font-semibold text-gray-700 truncate">Administrator</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
