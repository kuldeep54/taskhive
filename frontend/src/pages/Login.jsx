import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[420px] bg-card border border-border rounded-xl shadow-teal-glow overflow-hidden p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-background font-bold text-2xl">
              TH
            </div>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">TaskHive</h1>
          <p className="text-text-secondary text-sm mt-1">Your team's central hub for tasks</p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-[#13151f] rounded-lg mb-8 border border-border">
          <button className="flex-1 py-2.5 text-sm font-bold text-background bg-primary rounded-lg transition-all">
            Sign In
          </button>
          <Link 
            to="/register" 
            className="flex-1 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-all text-center"
          >
            Register
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 bg-[#13151f] border border-border rounded-lg px-3 text-text-primary focus:border-primary placeholder-[#8b8fa8] transition-all outline-none"
              placeholder="name@company.com"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-text-secondary">Password</label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 bg-[#13151f] border border-border rounded-lg px-3 text-text-primary focus:border-primary placeholder-[#8b8fa8] transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary hover:brightness-110 text-[#0f1117] font-bold rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 rounded border-border bg-[#13151f] text-primary focus:ring-primary accent-primary"
            />
            <label htmlFor="remember" className="text-sm text-text-secondary cursor-pointer">
              Remember me
            </label>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
