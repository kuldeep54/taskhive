import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Loader2
} from 'lucide-react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/dashboard');
      setStats(data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-text-secondary font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Tasks', value: stats.totalTasks, icon: CheckSquare, color: 'text-info', bg: 'bg-info/10' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-error', bg: 'bg-error/10' },
  ];

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return 'badge badge-high';
      case 'medium': return 'badge badge-medium';
      case 'low': return 'badge badge-low';
      default: return 'badge badge-todo';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'inprogress': return 'badge badge-progress';
      case 'done': return 'badge badge-done';
      case 'todo': return 'badge badge-todo';
      default: return 'badge badge-todo';
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section>
        <h1 className="text-3xl font-bold text-text-primary">
          {isAdmin ? 'My Dashboard' : 'My Tasks'}
        </h1>
        <p className="text-text-secondary mt-1">Welcome back, {user?.name}</p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <button className="text-text-secondary hover:text-text-primary">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            <p className="text-3xl font-bold text-text-primary">{stat.value.toString().padStart(2, '0')}</p>
            <p className="text-sm font-medium text-text-secondary mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Bottom section — layout differs for Admin vs Member */}
      <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : ''} gap-8`}>
        {/* Recent Tasks — full width for member, 2/3 for admin */}
        <div className={`${isAdmin ? 'lg:col-span-2' : ''} space-y-6`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-text-primary">
              {isAdmin ? 'Recent Tasks' : 'My Assigned Tasks'}
            </h3>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-[#13151f]/50">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider">Title</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider">Project</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider text-right">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.recentTasks.length > 0 ? (
                    stats.recentTasks.map((task) => (
                      <tr key={task._id} className="hover:bg-[#13151f]/30 transition-all cursor-pointer">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-text-primary truncate max-w-[200px]">{task.title}</p>
                          {isAdmin && (
                            <p className="text-xs text-text-secondary mt-0.5">Assigned to {task.assignedTo?.name || 'Unassigned'}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary truncate max-w-[120px]">
                          {task.project?.title || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={getStatusBadge(task.status)}>{task.status}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary text-right">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-text-secondary">
                        {isAdmin ? 'No tasks found.' : 'No tasks assigned to you yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tasks per User — ADMIN ONLY */}
        {isAdmin && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-text-primary">Tasks per User</h3>
            <div className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm">
              {stats.tasksPerUser && stats.tasksPerUser.length > 0 ? (
                stats.tasksPerUser.map((u, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                        {u.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">{u.name}</p>
                        <p className="text-[10px] font-black uppercase text-text-secondary tracking-tighter">{u.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-text-primary">{u.count}</p>
                      <p className="text-[10px] font-bold text-text-secondary uppercase">Tasks</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-secondary text-center italic">No user task data available.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
