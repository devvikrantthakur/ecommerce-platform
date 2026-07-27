import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Users, Loader, Shield, Lock, Unlock } from 'lucide-react';

const AdminUsers = () => {
  const { showToast } = useToast();
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      if (res.data && res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load user accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, userEmail) => {
    if (userEmail === currentAdmin?.email) {
      showToast('Cannot block your own administrator account!', 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to block user ${userEmail}? They will not be able to log in.`)) {
      setUpdatingId(userId);
      try {
        const res = await api.patch(`/users/${userId}/block`);
        if (res.data && res.data.success) {
          showToast('User account blocked successfully', 'success');
          setUsers(users.map(u => u.userId === userId ? res.data.data : u));
        }
      } catch (err) {
        showToast('Failed to block user', 'error');
      } finally {
        setUpdatingId(null);
      }
    }
  };

  const handleActivateUser = async (userId) => {
    setUpdatingId(userId);
    try {
      const res = await api.patch(`/users/${userId}/activate`);
      if (res.data && res.data.success) {
        showToast('User account activated successfully', 'success');
        setUsers(users.map(u => u.userId === userId ? res.data.data : u));
      }
    } catch (err) {
      showToast('Failed to activate user', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && users.length === 0) {
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
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">User Accounts</h1>
          <p className="text-gray-500 text-xs mt-1">Manage user roles and registration access.</p>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Mobile</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Access Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y text-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400">
                    No user accounts found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.userId} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4 text-xs font-mono">{u.mobileNumber || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {u.roleName === 'ROLE_ADMIN' ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-yellow-700 bg-yellow-50 px-2.5 py-0.5 rounded border border-yellow-250">
                          <Shield size={10} />
                          <span>Admin</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border">
                          Customer
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.statusName === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}>
                        {u.statusName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center">
                        {u.roleName === 'ROLE_ADMIN' ? (
                          <span className="text-[10px] font-semibold text-gray-400 italic">Self protected</span>
                        ) : u.statusName === 'ACTIVE' ? (
                          <button
                            disabled={updatingId === u.userId}
                            onClick={() => handleBlockUser(u.userId, u.email)}
                            className="px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-lg text-xs flex items-center space-x-1 transition-colors border border-rose-200 disabled:opacity-40"
                          >
                            <Lock size={12} />
                            <span>Block User</span>
                          </button>
                        ) : (
                          <button
                            disabled={updatingId === u.userId}
                            onClick={() => handleActivateUser(u.userId)}
                            className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg text-xs flex items-center space-x-1 transition-colors border border-emerald-250 disabled:opacity-40"
                          >
                            <Unlock size={12} />
                            <span>Activate</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
