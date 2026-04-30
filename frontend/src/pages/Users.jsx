import { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Search, 
  Shield, 
  User as UserIcon, 
  Trash2, 
  RefreshCcw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = 'Users | TaskHive';
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/users');
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole.toUpperCase()}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the team?`)) {
      try {
        await API.delete(`/users/${userId}`);
        toast.success('User removed from team');
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    members: users.filter(u => u.role === 'member').length
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold text-text-primary">Users</h1>
        <p className="text-text-secondary mt-1">{stats.total} members total</p>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-info/10 text-info">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Total Members</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{stats.admins}</p>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Admin Users</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{stats.members}</p>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Member Users</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Search users by name or email..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-lg pl-12 pr-4 py-3 text-text-primary focus:border-primary outline-none transition-all shadow-sm"
        />
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-[#13151f]/50">
                <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider text-center">Tasks</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan="6" className="px-6 py-4"><Skeleton className="h-10 w-full" /></td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-[#13151f]/30 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                          {u.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-bold text-text-primary">{u.name} {u._id === currentUser._id && "(You)"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                        u.role === 'admin' 
                          ? 'bg-primary/10 text-primary border-primary/30' 
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-sm font-bold text-text-primary">{u.taskCount}</p>
                      <p className="text-[10px] text-text-secondary uppercase font-bold">Tasks</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-text-secondary font-medium">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u._id !== currentUser._id ? (
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleRoleChange(u._id, u.role === 'admin' ? 'member' : 'admin')}
                            title={`Switch to ${u.role === 'admin' ? 'Member' : 'Admin'}`}
                            className="p-2 bg-[#13151f] border border-border rounded-lg text-text-secondary hover:text-primary hover:border-primary transition-all group"
                          >
                            <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                          </button>
                          {u.role === 'member' ? (
                            <button 
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              title="Remove Member"
                              className="p-2 bg-[#13151f] border border-border rounded-lg text-text-secondary hover:text-error hover:border-error transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span title="Demote to Member first to remove this admin" className="p-2 rounded-lg border border-border/30 text-border cursor-not-allowed" >
                              <Trash2 className="w-4 h-4 opacity-30" />
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-text-secondary uppercase bg-border/20 px-2 py-1 rounded">You</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-0">
                    <EmptyState 
                      icon={UsersIcon}
                      title="No users found"
                      description="We couldn't find any team members matching your search criteria."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
