import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-amazon-blue text-gray-300 mt-auto border-t border-gray-800">
      {/* Back to top banner */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full py-4 bg-amazon-lightBlue text-white hover:bg-gray-700 text-center text-sm font-medium transition-colors"
      >
        Back to top
      </button>

      {/* <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Get to Know Us</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:underline">Careers</a></li>
            <li><a href="#" className="hover:underline">About NexShop</a></li>
            <li><a href="#" className="hover:underline">Investor Relations</a></li>
            <li><a href="#" className="hover:underline">NexShop Devices</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Make Money with Us</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:underline">Sell products on NexShop</a></li>
            <li><a href="#" className="hover:underline">Sell on NexShop Business</a></li>
            <li><a href="#" className="hover:underline">Become an Affiliate</a></li>
            <li><a href="#" className="hover:underline">Advertise Your Products</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">NexShop Payment Products</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:underline">NexShop Reward Visa Signature Cards</a></li>
            <li><a href="#" className="hover:underline">NexShop.com Store Card</a></li>
            <li><a href="#" className="hover:underline">NexShop Secured Card</a></li>
            <li><a href="#" className="hover:underline">NexShop Business Card</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Let Us Help You</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/profile" className="hover:underline">Your Account</Link></li>
            <li><Link to="/orders" className="hover:underline">Your Orders</Link></li>
            <li><a href="#" className="hover:underline">Shipping Rates & Policies</a></li>
            <li><a href="#" className="hover:underline">Returns & Replacements</a></li>
          </ul>
        </div>
      </div> */}

      <div className="bg-amazon-lightBlue py-6 text-center text-xs text-gray-400 border-t border-gray-800">
        <p>&copy; {new Date().getFullYear()} NexShop, Inc. or its affiliates. All rights reserved.</p>
        {/* <p className="mt-2 text-gray-500">NexShop Clone Portfolio App - Developed for DevOps & Cloud Architect validations.</p> */}
      </div>
    </footer>
  );
};

export default Footer;
