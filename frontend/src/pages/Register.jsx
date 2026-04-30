import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Loader2, User, Shield } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'member',
  });
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, role } = formData;

    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, role });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[480px] bg-card border border-border rounded-xl shadow-teal-glow overflow-hidden p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-background font-bold text-2xl">
              TT
            </div>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Create Account</h1>
          <p className="text-text-secondary text-sm mt-1">Join TaskHive today</p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-[#13151f] rounded-lg mb-6 border border-border">
          <Link 
            to="/login" 
            className="flex-1 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-all text-center"
          >
            Sign In
          </Link>
          <button className="flex-1 py-2.5 text-sm font-bold text-background bg-primary rounded-lg transition-all">
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Select Role</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'admin' })}
                className={`flex items-center justify-center gap-2 h-11 rounded-lg border transition-all ${
                  formData.role === 'admin'
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-border text-text-primary bg-[#13151f] hover:border-text-secondary'
                }`}
              >
                <Shield className="w-4 h-4" /> Admin
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'member' })}
                className={`flex items-center justify-center gap-2 h-11 rounded-lg border transition-all ${
                  formData.role === 'member'
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-border text-text-primary bg-[#13151f] hover:border-text-secondary'
                }`}
              >
                <User className="w-4 h-4" /> Member
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full h-11 bg-[#13151f] border border-border rounded-lg px-3 text-text-primary focus:border-primary placeholder-[#8b8fa8] transition-all outline-none"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full h-11 bg-[#13151f] border border-border rounded-lg px-3 text-text-primary focus:border-primary placeholder-[#8b8fa8] transition-all outline-none"
              placeholder="john@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full h-11 bg-[#13151f] border border-border rounded-lg px-3 text-text-primary focus:border-primary placeholder-[#8b8fa8] transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Confirm</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full h-11 bg-[#13151f] border border-border rounded-lg px-3 text-text-primary focus:border-primary placeholder-[#8b8fa8] transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary hover:brightness-110 text-[#0f1117] font-bold rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>

          <p className="text-center text-sm text-text-secondary pt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
