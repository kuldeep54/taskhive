import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import {
  User,
  Lock,
  Save,
  Loader2,
  Info
} from 'lucide-react';

const Profile = () => {
  const { user: currentUser } = useAuth();

  // Profile Info state
  const [name, setName] = useState(currentUser?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  // Stats
  const [accountStats, setAccountStats] = useState({ taskCount: 0, status: 'Active' });

  useEffect(() => {
    document.title = 'Profile & Settings | TaskHive';
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/tasks');
      setAccountStats({ taskCount: data.length, status: 'Active' });
    } catch {
      // silently fail
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty');
    setSavingProfile(true);
    try {
      await API.put('/users/profile/name', { name: name.trim() });
      const updatedUser = { ...currentUser, name: name.trim() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully!');
      // Update display without full reload
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setSavingPassword(true);
    try {
      await API.put('/users/profile/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const initials = currentUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  const userId = currentUser?._id ? `${currentUser._id.slice(0, 8)}...` : 'N/A';
  const memberSince = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const inputClass =
    'w-full bg-transparent border-b border-border px-0 py-2 text-text-primary placeholder-text-secondary/50 outline-none focus:border-primary transition-colors text-sm';
  const labelClass = 'block text-xs text-text-secondary mb-1';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profile &amp; Settings</h1>
        <p className="text-text-secondary text-sm mt-1">Manage your account settings and preferences</p>
      </div>

      {/* ── Section 1: Profile Information ── */}
      <div className="bg-card border border-border rounded-xl p-8">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">Profile Information</h2>
            <p className="text-xs text-text-secondary">Update your personal details</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Full Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={currentUser?.email || ''}
                readOnly
                className={`${inputClass} cursor-not-allowed opacity-60`}
              />
            </div>
          </div>

          {/* Role + Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Role</label>
              <div className="py-2">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-[11px] font-black uppercase tracking-widest border ${
                  currentUser?.role === 'admin'
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                }`}>
                  {currentUser?.role}
                </span>
              </div>
            </div>
            <div>
              <label className={labelClass}>Account Status</label>
              <div className="py-2">
                <span className="inline-flex items-center px-3 py-1.5 rounded-md text-[11px] font-black uppercase tracking-widest bg-success/10 text-success border border-success/30">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:brightness-110 text-[#0f1117] font-black text-xs uppercase tracking-widest rounded-lg transition-all shadow-teal-glow disabled:opacity-70"
            >
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* ── Section 2: Change Password ── */}
      <div className="bg-card border border-border rounded-xl p-8">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">Change Password</h2>
            <p className="text-xs text-text-secondary">Update your login credentials</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-6">
          {/* Current Password — full width */}
          <div>
            <label className={labelClass}>Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className={inputClass}
              placeholder="Enter current password"
              required
            />
          </div>

          {/* New + Confirm side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className={inputClass}
                placeholder="Enter new password"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className={inputClass}
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#13151f] border border-border hover:border-primary text-text-secondary hover:text-primary font-black text-xs uppercase tracking-widest rounded-lg transition-all disabled:opacity-70"
            >
              {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Change Password
            </button>
          </div>
        </form>
      </div>

      {/* ── Section 3: Account Information ── */}
      <div className="bg-card border border-border rounded-xl p-8">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">Account Information</h2>
            <p className="text-xs text-text-secondary">Your account details and activity summary</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-text-secondary mb-1">User ID</p>
            <p className="text-sm font-bold text-text-primary font-mono">{userId}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-1">Member Since</p>
            <p className="text-sm font-bold text-text-primary">{memberSince}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-1">Status</p>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-success/10 text-success border border-success/30">
              Active
            </span>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-1">Tasks Assigned</p>
            <p className="text-sm font-bold text-text-primary">{accountStats.taskCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
