import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  AlertCircle,
  Loader2,
  Calendar,
  CheckCircle2,
  Download,
  ChevronDown,
  CheckSquare
} from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import Modal from '../components/Modal';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const Tasks = () => {
  const { user: currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    project: '',
  });

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    assignedTo: '',
    project: '',
    status: 'todo'
  });

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    document.title = 'Tasks | TaskHive';
    fetchInitialData();
    fetchTasks();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        API.get('/projects'),
        isAdmin ? API.get('/users') : Promise.resolve({ data: [] })
      ]);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to fetch initial data');
    }
  };

  const fetchTasks = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.status) params.append('status', currentFilters.status);
      if (currentFilters.priority) params.append('priority', currentFilters.priority);
      if (currentFilters.project) params.append('project', currentFilters.project);

      const { data } = await API.get(`/tasks?${params.toString()}`);
      setTasks(data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    if (name !== 'search') {
      fetchTasks(newFilters);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create a copy of formData to clean values before sending
    const cleanedData = { 
      ...formData,
      // If dueDate is an empty string, send null so the backend handles it properly
      dueDate: formData.dueDate || null,
      // If assignedTo is empty string, send null
      assignedTo: formData.assignedTo || null,
      // If project is empty string, send null
      project: formData.project || null
    };

    try {
      if (isEditMode) {
        await API.put(`/tasks/${selectedTask._id}`, cleanedData);
        toast.success('Task updated successfully');
      } else {
        await API.post('/tasks', cleanedData);
        toast.success('Task created successfully');
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setIsEditMode(true);
    setFormData({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority,
      assignedTo: task.assignedTo?._id || '',
      project: task.project?._id || '',
      status: task.status
    });
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await API.delete(`/tasks/${id}`);
        toast.success('Task deleted');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await API.put(`/tasks/${id}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus.toUpperCase()}`);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'done') return false;
    return new Date(dueDate) < new Date();
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      default: return '';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'todo': return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
      case 'inprogress': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'done': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      default: return '';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Tasks</h1>
          <p className="text-text-secondary mt-1">{tasks.length} tasks total</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => {
              setIsEditMode(false);
              setFormData({ title: '', description: '', dueDate: '', priority: 'medium', assignedTo: '', project: '', status: 'todo' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:brightness-110 text-[#0f1117] font-black uppercase text-xs tracking-widest rounded-lg transition-all transform active:scale-95 shadow-teal-glow"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full bg-[#13151f] border border-border rounded-lg pl-10 pr-4 py-2 text-[11px] font-bold text-text-primary focus:border-primary outline-none transition-all"
          />
        </div>
        
        <select 
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="bg-[#13151f] border border-border rounded-lg px-3 py-2 text-[11px] font-bold text-text-primary focus:border-primary outline-none transition-all uppercase"
        >
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="inprogress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select 
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="bg-[#13151f] border border-border rounded-lg px-3 py-2 text-[11px] font-bold text-text-primary focus:border-primary outline-none transition-all uppercase"
        >
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select 
          value={filters.project}
          onChange={(e) => handleFilterChange('project', e.target.value)}
          className="bg-[#13151f] border border-border rounded-lg px-3 py-2 text-[11px] font-bold text-text-primary focus:border-primary outline-none transition-all uppercase"
        >
          <option value="">All Projects</option>
          {projects.map(p => (
            <option key={p._id} value={p._id}>{p.title}</option>
          ))}
        </select>

        <div className="flex gap-2 lg:col-span-1">
          <button className="flex-1 bg-[#13151f] border border-border rounded-lg px-3 py-2 text-[10px] font-black text-text-secondary hover:text-text-primary transition-all flex items-center justify-center gap-2 uppercase tracking-tighter">
            <Download className="w-4 h-4" /> CSV | EXCEL
          </button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-[#13151f]/50">
                <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary tracking-widest">Title</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary tracking-widest">Project</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary tracking-widest">Priority</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary tracking-widest">Assigned To</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary tracking-widest">Due Date</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-text-secondary tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan="7" className="px-6 py-4"><Skeleton className="h-12 w-full" /></td>
                  </tr>
                ))
              ) : tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-[#13151f]/30 transition-all">
                    <td className="px-6 py-4 max-w-[250px]">
                      <p className="text-sm font-bold text-text-primary truncate">{task.title}</p>
                      <p className="text-[10px] text-text-secondary mt-0.5 line-clamp-1 italic">{task.description}</p>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-bold text-text-secondary truncate max-w-[120px] uppercase">
                      {task.project?.title || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getPriorityClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative group/status">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${getStatusClass(task.status)}`}>
                          {task.status}
                          {!isAdmin && task.assignedTo?._id === currentUser?._id && <ChevronDown className="w-3 h-3" />}
                        </span>
                        
                        {!isAdmin && task.assignedTo?._id === currentUser?._id && (
                          <div className="absolute top-full left-0 mt-1 w-32 bg-[#1a1d27] border border-border rounded-lg shadow-2xl py-1 z-20 hidden group-hover/status:block">
                            {['todo', 'inprogress', 'done'].map(s => (
                              <button 
                                key={s}
                                onClick={() => handleStatusUpdate(task._id, s)}
                                className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 transition-colors ${task.status === s ? 'text-primary' : 'text-text-secondary'}`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[9px] font-black text-primary uppercase">
                          {task.assignedTo?.name.split(' ').map(n => n[0]).join('') || '?'}
                        </div>
                        <span className="text-xs font-bold text-text-primary">{task.assignedTo?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 text-xs font-bold ${isOverdue(task.dueDate, task.status) ? 'text-error animate-pulse' : 'text-text-secondary'}`}>
                        {isOverdue(task.dueDate, task.status) && <AlertCircle className="w-4 h-4" />}
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isAdmin ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEditClick(task)} className="p-2 bg-[#13151f] border border-border rounded-lg text-text-secondary hover:text-primary hover:border-primary transition-all">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteTask(task._id)} className="p-2 bg-[#13151f] border border-border rounded-lg text-text-secondary hover:text-error hover:border-error transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button className="p-1.5 text-text-secondary">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-0">
                    <EmptyState 
                      icon={CheckSquare}
                      title="No tasks found"
                      description="We couldn't find any tasks matching your current filters."
                      actionText="Clear Filters"
                      onAction={() => setFilters({ search: '', status: '', priority: '', project: '' })}
                      isAdmin={true}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Edit Task" : "Create New Task"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-text-secondary uppercase tracking-widest">Task Title</label>
            <input 
              type="text" required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full h-11 bg-[#13151f] border border-border rounded-lg px-4 text-text-primary focus:border-primary outline-none transition-all shadow-inner"
              placeholder="e.g. Implement user authentication"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-text-secondary uppercase tracking-widest">Description</label>
            <textarea 
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-[#13151f] border border-border rounded-lg px-4 py-3 text-text-primary focus:border-primary outline-none transition-all resize-none shadow-inner"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-text-secondary uppercase tracking-widest">Due Date</label>
              <input 
                type="date" 
                value={formData.dueDate} 
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})} 
                className="w-full h-11 bg-[#13151f] border border-border rounded-lg px-4 text-text-primary focus:border-primary outline-none transition-all color-scheme-dark hover:border-primary/50" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-text-secondary uppercase tracking-widest">Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full h-11 bg-[#13151f] border border-border rounded-lg px-3 text-text-primary focus:border-primary outline-none transition-all uppercase text-[11px] font-bold">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-text-secondary uppercase tracking-widest">Assign To</label>
              <select value={formData.assignedTo} onChange={(e) => setFormData({...formData, assignedTo: e.target.value})} className="w-full h-11 bg-[#13151f] border border-border rounded-lg px-3 text-text-primary focus:border-primary outline-none transition-all text-[11px] font-bold">
                <option value="">Unassigned</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-text-secondary uppercase tracking-widest">Project</label>
              <select value={formData.project} onChange={(e) => setFormData({...formData, project: e.target.value})} className="w-full h-11 bg-[#13151f] border border-border rounded-lg px-3 text-text-primary focus:border-primary outline-none transition-all text-[11px] font-bold">
                <option value="">No Project</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-4 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-[11px] font-black text-text-secondary uppercase tracking-widest">Cancel</button>
            <button type="submit" className="px-8 py-2.5 bg-primary hover:brightness-110 text-[#0f1117] font-black text-[11px] uppercase tracking-widest rounded-lg transition-all shadow-teal-glow">
              {isEditMode ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
