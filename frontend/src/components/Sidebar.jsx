import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  LogOut, 
  X,
  User
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Projects', icon: FolderKanban, path: '/projects' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ name: 'Users', icon: Users, path: '/users' });
  }

  return (
    <>
      {/* Sidebar Content */}
      <div className={`fixed left-0 top-0 h-full w-[240px] bg-sidebar border-r border-border z-[60] flex flex-col transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-[#0f1117]">
              TH
            </div>
            <span className="text-xl font-bold text-text-primary tracking-tight">TaskHive</span>
          </div>
          <button className="lg:hidden p-1 text-text-secondary hover:text-text-primary" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => { if(window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-lg transition-all font-bold group
                ${isActive 
                  ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-[0_0_15px_rgba(0,212,170,0.1)]' 
                  : 'text-text-secondary hover:bg-[#1a1d27] hover:text-text-primary'
                }
              `}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 duration-300`} />
              <span className="text-sm tracking-wide">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-border/50 bg-[#13151f]/50">
          <NavLink
            to="/profile"
            onClick={() => { if(window.innerWidth < 1024) onClose(); }}
            className={({ isActive }) => `flex items-center gap-4 mb-4 px-3 py-2 rounded-lg transition-all cursor-pointer group ${isActive ? 'bg-primary/10' : 'hover:bg-[#1a1d27]'}`}
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold shadow-sm group-hover:border-primary transition-all flex-shrink-0">
              {user?.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-text-primary truncate group-hover:text-primary transition-colors">{user?.name}</p>
              <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest bg-border/20 px-1.5 py-0.5 rounded">
                {user?.role}
              </span>
            </div>
          </NavLink>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-text-secondary hover:bg-error/10 hover:text-error rounded-lg transition-all font-bold group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="text-sm tracking-wide">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
