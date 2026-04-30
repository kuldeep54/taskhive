import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell, User as UserIcon, AlertCircle, Clock, CheckSquare,
  X, RefreshCw, Trash2, CheckCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const POLL_INTERVAL = 60000;
const LS_KEY = 'tt_read_notifications';

// ── Helpers ────────────────────────────────────────────────────────────────
const loadReadIds = () => {
  try { return new Set(JSON.parse(localStorage.getItem(LS_KEY) || '[]')); }
  catch { return new Set(); }
};
const saveReadIds = (set) => {
  localStorage.setItem(LS_KEY, JSON.stringify([...set]));
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const groupByTime = (notifications) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;

  const groups = { Today: [], Yesterday: [], Earlier: [] };
  notifications.forEach((n) => {
    const t = new Date(n.time).getTime();
    if (t >= todayStart) groups.Today.push(n);
    else if (t >= yesterdayStart) groups.Yesterday.push(n);
    else groups.Earlier.push(n);
  });
  return groups;
};

// ── Sub-components ─────────────────────────────────────────────────────────
const typeConfig = {
  overdue:  { icon: AlertCircle, color: 'text-error',   border: 'border-l-error',   bg: 'bg-error/10',   label: 'Overdue' },
  due_soon: { icon: Clock,       color: 'text-warning',  border: 'border-l-warning', bg: 'bg-warning/10', label: 'Due Soon' },
  assigned: { icon: CheckSquare, color: 'text-primary',  border: 'border-l-primary', bg: 'bg-primary/10', label: 'Assigned' },
};

const NotifIcon = ({ type }) => {
  const cfg = typeConfig[type] || { icon: Bell, color: 'text-text-secondary' };
  const Icon = cfg.icon;
  return <Icon className={`w-4 h-4 flex-shrink-0 ${cfg.color}`} />;
};

const SkeletonRow = () => (
  <div className="flex items-start gap-3 px-5 py-4 border-b border-border/50 animate-pulse">
    <div className="w-4 h-4 bg-border/40 rounded-full mt-0.5 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-border/40 rounded w-1/3" />
      <div className="h-2.5 bg-border/30 rounded w-2/3" />
      <div className="h-2 bg-border/20 rounded w-1/4" />
    </div>
  </div>
);

// ── Main Header ────────────────────────────────────────────────────────────
const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const [readIds, setReadIds] = useState(loadReadIds);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ── Derived ──────────────────────────────────────────────────────────────
  const visible = notifications.filter(n => !dismissed.has(n.id));
  const unreadCount = visible.filter(n => !readIds.has(n.id)).length;
  const tabFiltered = tab === 'unread' ? visible.filter(n => !readIds.has(n.id)) : visible;
  const grouped = groupByTime(tabFiltered);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true); else setLoading(true);
    try {
      const { data } = await API.get('/notifications');
      const fetched = data.notifications || [];
      setNotifications(fetched);
    } catch { /* silent */ }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // ── Outside click ────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────
  const openPanel = () => {
    setOpen(p => !p);
    // auto-mark all as read when panel opens
    if (!open && visible.length > 0) {
      const newRead = new Set([...readIds, ...visible.map(n => n.id)]);
      setReadIds(newRead);
      saveReadIds(newRead);
    }
  };

  const markRead = (e, id) => {
    e.stopPropagation();
    const newRead = new Set([...readIds, id]);
    setReadIds(newRead);
    saveReadIds(newRead);
  };

  const markAllRead = () => {
    const newRead = new Set([...readIds, ...visible.map(n => n.id)]);
    setReadIds(newRead);
    saveReadIds(newRead);
  };

  const dismiss = (e, id) => {
    e.stopPropagation();
    setDismissed(prev => new Set([...prev, id]));
  };

  const clearAll = () => {
    const allIds = new Set(visible.map(n => n.id));
    setDismissed(prev => new Set([...prev, ...allIds]));
  };

  const handleClick = (n) => {
    // mark as read
    const newRead = new Set([...readIds, n.id]);
    setReadIds(newRead);
    saveReadIds(newRead);
    navigate('/tasks');
    setOpen(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <header className="h-[60px] bg-sidebar border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <div />

      <div className="flex items-center gap-4">
        {/* ── Bell Button ── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={openPanel}
            className={`relative p-2 rounded-lg transition-all ${open ? 'text-primary bg-primary/10' : 'text-text-secondary hover:text-primary hover:bg-primary/5'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-error text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 border-2 border-sidebar animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* ── Dropdown ── */}
          {open && (
            <div className="absolute right-0 top-[calc(100%+10px)] w-[380px] bg-card border border-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in"
              style={{ maxHeight: '520px' }}>

              {/* ── Panel Header ── */}
              <div className="px-5 pt-4 pb-3 border-b border-border bg-[#13151f]/70 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="bg-error text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2">
                    {/* Refresh */}
                    <button
                      onClick={() => fetchNotifications(true)}
                      title="Refresh"
                      className={`p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/5 transition-all ${refreshing ? 'animate-spin text-primary' : ''}`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    {/* Clear All */}
                    {visible.length > 0 && (
                      <button
                        onClick={clearAll}
                        title="Clear all"
                        className="p-1.5 rounded-lg text-text-secondary hover:text-error hover:bg-error/5 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {/* Mark all read */}
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        title="Mark all read"
                        className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/5 transition-all"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => setOpen(false)} className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-[#0f1117] p-1 rounded-lg">
                  {['all', 'unread'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-md transition-all ${
                        tab === t ? 'bg-primary text-[#0f1117]' : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {t === 'all' ? `All (${visible.length})` : `Unread (${unreadCount})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Notification List ── */}
              <div className="overflow-y-auto custom-scrollbar flex-1">
                {loading && visible.length === 0 ? (
                  <>
                    <SkeletonRow /><SkeletonRow /><SkeletonRow />
                  </>
                ) : tabFiltered.length === 0 ? (
                  <div className="py-14 text-center space-y-3 px-6">
                    <div className="w-14 h-14 rounded-full bg-border/10 flex items-center justify-center mx-auto">
                      <Bell className="w-7 h-7 text-border" />
                    </div>
                    <p className="text-sm font-bold text-text-secondary">
                      {tab === 'unread' ? 'No unread notifications' : 'No notifications'}
                    </p>
                    <p className="text-xs text-text-secondary/50">
                      {tab === 'unread' ? 'You\'re all caught up!' : 'Tasks with deadlines will appear here.'}
                    </p>
                  </div>
                ) : (
                  Object.entries(grouped).map(([group, items]) =>
                    items.length > 0 && (
                      <div key={group}>
                        {/* Group label */}
                        <div className="px-5 py-2 bg-[#13151f]/50 border-b border-border/30">
                          <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">{group}</span>
                        </div>

                        {items.map(n => {
                          const isRead = readIds.has(n.id);
                          const cfg = typeConfig[n.type] || {};
                          return (
                            <div
                              key={n.id}
                              onClick={() => handleClick(n)}
                              className={`flex items-start gap-3 px-5 py-3.5 border-b border-border/40 border-l-2 ${cfg.border || 'border-l-border'} hover:bg-[#13151f]/50 transition-all cursor-pointer group/item relative ${!isRead ? 'bg-primary/[0.02]' : ''}`}
                            >
                              {/* Type icon in colored pill */}
                              <div className={`w-7 h-7 rounded-lg ${cfg.bg || 'bg-border/10'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                <NotifIcon type={n.type} />
                              </div>

                              <div className="flex-1 min-w-0 pr-2">
                                <div className="flex items-center gap-2">
                                  <p className={`text-xs font-black uppercase tracking-wider ${isRead ? 'text-text-secondary' : 'text-text-primary'}`}>
                                    {n.title}
                                  </p>
                                  {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                                </div>
                                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                                <p className="text-[10px] text-text-secondary/50 mt-1">{timeAgo(n.time)}</p>
                              </div>

                              {/* Actions on hover */}
                              <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
                                {!isRead && (
                                  <button
                                    onClick={(e) => markRead(e, n.id)}
                                    title="Mark as read"
                                    className="p-1 rounded text-text-secondary hover:text-primary hover:bg-primary/10 transition-all"
                                  >
                                    <CheckCheck className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => dismiss(e, n.id)}
                                  title="Dismiss"
                                  className="p-1 rounded text-text-secondary hover:text-error hover:bg-error/10 transition-all"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  )
                )}
              </div>

              {/* ── Footer ── */}
              {visible.length > 0 && (
                <div className="px-5 py-3 border-t border-border bg-[#13151f]/60 flex items-center justify-between flex-shrink-0">
                  <span className="text-[10px] text-text-secondary/60">
                    Auto-refreshes every minute
                  </span>
                  <button
                    onClick={() => { navigate('/tasks'); setOpen(false); }}
                    className="text-[10px] font-black text-primary hover:text-white uppercase tracking-widest transition-colors"
                  >
                    View all tasks →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── User Avatar ── */}
        <div
          className="flex items-center gap-3 pl-4 border-l border-border cursor-pointer group"
          onClick={() => navigate('/profile')}
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs group-hover:border-primary transition-all">
            {user?.name?.split(' ').map(n => n[0]).join('') || <UserIcon className="w-4 h-4" />}
          </div>
          <span className="text-sm font-medium text-text-primary hidden sm:inline-block group-hover:text-primary transition-colors">
            {user?.name?.split(' ')[0]}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
