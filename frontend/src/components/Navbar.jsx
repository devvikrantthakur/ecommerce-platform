import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, Search, LogOut, Shield, Menu, X, ChevronDown, Package } from 'lucide-react';

const Navbar = ({ onSearch }) => {
  const { user, logout, isAdmin } = useAuth();
  const { cartItemsCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-amazon-blue text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold tracking-wider text-amazon-orange">
              <span className="text-white font-extrabold text-2xl font-serif">Nex</span>
              <span>Shop</span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full flex">
              <input
                id="navbar-search-input"
                type="text"
                placeholder="Search products, brands and categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-gray-900 bg-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-amazon-orange"
              />
              <button
                id="navbar-search-btn"
                type="submit"
                className="bg-amazon-orange text-amazon-blue px-5 rounded-r-md hover:bg-yellow-500 transition-colors flex items-center justify-center"
              >
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-amazon-orange transition-colors text-sm font-medium">
              Home
            </Link>

            {isAdmin() && (
              <Link to="/admin/dashboard" className="flex items-center text-yellow-400 hover:text-white transition-colors text-sm font-medium space-x-1">
                <Shield size={16} />
                <span>Admin Portal</span>
              </Link>
            )}

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  id="profile-dropdown-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-1 text-sm font-medium hover:text-amazon-orange focus:outline-none transition-colors"
                >
                  <User size={18} />
                  <span>Hello, {user.firstName}</span>
                  <ChevronDown size={14} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg py-1 border border-gray-100 animate-fadeIn">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      My Orders
                    </Link>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-1 text-sm font-medium hover:text-amazon-orange transition-colors">
                <User size={18} />
                <span>Sign In</span>
              </Link>
            )}

            {/* Cart Icon */}
            <Link to="/cart" className="relative flex items-center space-x-1 hover:text-amazon-orange transition-colors">
              <div className="relative p-1">
                <ShoppingCart size={22} />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amazon-orange text-amazon-blue text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-amazon-blue animate-bounce">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium">Cart</span>
            </Link>
          </div>

          {/* Hamburger Icon - Mobile */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative flex items-center text-white">
              <ShoppingCart size={22} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amazon-orange text-amazon-blue text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white hover:text-amazon-orange focus:outline-none"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-amazon-lightBlue px-2 pt-2 pb-4 space-y-1">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="flex px-3 py-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-gray-900 bg-white rounded-l-md focus:outline-none"
            />
            <button type="submit" className="bg-amazon-orange text-amazon-blue px-4 rounded-r-md">
              <Search size={16} />
            </button>
          </form>

          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
          >
            Home
          </Link>

          {isAdmin() && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-yellow-400 hover:bg-gray-700"
            >
              Admin Portal
            </Link>
          )}

          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
              >
                My Profile
              </Link>
              <Link
                to="/orders"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
              >
                My Orders
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-700"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
