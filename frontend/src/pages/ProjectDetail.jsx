import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Plus, 
  UserPlus, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  Calendar,
  Users as UsersIcon,
  CheckSquare
} from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import Modal from '../components/Modal';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  
  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  
  const [editData, setEditData] = useState({ title: '', description: '' });

  useEffect(() => {
    document.title = 'Project Detail | TaskHive';
    fetchProject();
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data } = await API.get(`/projects/${id}`);
      setProject(data);
      setEditData({ title: data.title, description: data.description });
    } catch (error) {
      toast.error('Failed to fetch project details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/users');
      setAllUsers(data);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await API.delete(`/projects/${id}`);
        toast.success('Project deleted');
        navigate('/projects');
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put(`/projects/${id}`, editData);
      setProject({ ...project, ...data });
      toast.success('Project updated');
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  const handleAddMember = async (userId) => {
    try {
      const { data } = await API.post(`/projects/${id}/members`, { userId });
      setProject(data);
      toast.success('Member added to project');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Remove this member from the project?')) {
      try {
        const { data } = await API.delete(`/projects/${id}/members/${userId}`);
        setProject(data);
        toast.success('Member removed');
      } catch (error) {
        toast.error('Failed to remove member');
      }
    }
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'done') return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/projects" className="p-2 bg-card border border-border rounded-lg text-text-secondary hover:text-primary transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">{project.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="badge badge-done uppercase tracking-widest text-[10px] font-black">Active Project</span>
              <span className="text-text-secondary text-xs font-medium">Created on {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}</span>
            </div>
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-text-secondary hover:text-primary hover:border-primary transition-all font-bold text-sm"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
            <button 
              onClick={handleDeleteProject}
              className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-text-secondary hover:text-error hover:border-error transition-all font-bold text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tasks Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-text-primary">Project Tasks</h3>
              <span className="bg-[#13151f] text-text-secondary text-[10px] font-black px-2 py-0.5 rounded border border-border">
                {project.tasks?.length || 0} TOTAL
              </span>
            </div>
            {isAdmin && (
              <button 
                onClick={() => navigate('/tasks')}
                className="flex items-center gap-2 text-primary hover:text-white transition-all text-sm font-bold bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            )}
          </div>

          <div className="space-y-4">
            {project.tasks && project.tasks.length > 0 ? (
              project.tasks.map((task) => (
                <div 
                  key={task._id} 
                  className={`bg-card border-y border-r border-border rounded-r-lg p-5 flex flex-col gap-4 hover:border-primary/50 transition-all relative overflow-hidden group ${
                    isOverdue(task.dueDate, task.status) ? 'border-l-4 border-l-error' : 'border-l-4 border-l-border'
                  }`}
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className={`font-bold text-lg ${task.status === 'done' ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                        {task.title}
                      </h4>
                      <p className="text-sm text-text-secondary line-clamp-1 italic">{task.description || 'No description provided.'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${
                        task.priority === 'high' ? 'badge-high' : 
                        task.priority === 'medium' ? 'badge-medium' : 'badge-low'
                      } !text-[9px]`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-[10px]">
                        {task.assignedTo?.name ? task.assignedTo.name.split(' ').map(n => n[0]).join('') : '?'}
                      </div>
                      <span className="text-xs font-bold text-text-primary">{task.assignedTo?.name || 'Unassigned'}</span>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className={`flex items-center gap-1.5 text-xs font-bold ${isOverdue(task.dueDate, task.status) ? 'text-error' : 'text-text-secondary'}`}>
                        <Calendar className="w-4 h-4" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      </div>
                      <span className={`badge ${
                        task.status === 'inprogress' ? 'badge-progress' : 
                        task.status === 'done' ? 'badge-done' : 'badge-todo'
                      } !px-3 !py-1 !text-[9px] font-black`}>
                        {task.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Admin Actions Overlay (subtle) */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button className="p-1.5 hover:bg-primary/10 text-text-secondary hover:text-primary rounded"><Pencil className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 hover:bg-error/10 text-text-secondary hover:text-error rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <EmptyState 
                icon={CheckSquare}
                title="No tasks in this project"
                description="This project currently has no tasks. Start by adding one to keep your team on track."
                actionText="Add First Task"
                onAction={() => navigate('/tasks')}
                isAdmin={isAdmin}
              />
            )}
          </div>
        </div>

        {/* Right Column: Project Info & Members */}
        <div className="space-y-8">
          {/* Project Info Card */}
          <section className="bg-card border border-border rounded-xl overflow-hidden shadow-teal-glow">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-text-primary leading-tight">{project.title}</h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">{project.description || 'A team project created to achieve great things.'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#13151f] rounded-lg border border-border">
                  <p className="text-xl font-bold text-primary">{project.tasks?.length || 0}</p>
                  <p className="text-[10px] font-black text-text-secondary uppercase">Tasks</p>
                </div>
                <div className="p-3 bg-[#13151f] rounded-lg border border-border">
                  <p className="text-xl font-bold text-primary">{project.members.length}</p>
                  <p className="text-[10px] font-black text-text-secondary uppercase">Members</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary font-bold uppercase">Owner</span>
                  <span className="text-text-primary font-bold">{project.createdBy?.name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary font-bold uppercase">Started</span>
                  <span className="text-text-primary font-bold">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Members List Card */}
          <section className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between bg-[#13151f]/30">
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-text-primary uppercase tracking-wider text-xs">Members ({project.members.length})</h3>
              </div>
              {isAdmin && (
                <button 
                  onClick={() => setIsAddMemberModalOpen(true)}
                  className="p-1 hover:bg-primary/10 text-primary rounded transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="p-2 divide-y divide-border/50">
              {project.members.map((member) => (
                <div key={member._id} className="p-3 flex items-center justify-between group hover:bg-[#13151f]/50 transition-all rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0f1117] border border-border flex items-center justify-center text-text-primary font-bold text-[10px]">
                      {member?.name ? member.name.split(' ').map(n => n[0]).join('') : '?'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">{member?.name || 'Unknown Member'}</p>
                      <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">{member?.role || 'User'}</span>
                    </div>
                  </div>
                  {isAdmin && member?._id !== project.createdBy?._id && (
                    <button 
                      onClick={() => handleRemoveMember(member._id)}
                      className="p-1.5 text-text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-all hover:bg-error/5 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Project Details">
        <form onSubmit={handleUpdateProject} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-secondary uppercase tracking-wider">Project Title</label>
            <input 
              type="text" required
              value={editData.title}
              onChange={(e) => setEditData({...editData, title: e.target.value})}
              className="w-full h-11 bg-[#13151f] border border-border rounded-lg px-4 text-text-primary focus:border-primary outline-none transition-all shadow-inner"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-secondary uppercase tracking-wider">Description</label>
            <textarea 
              rows="4"
              value={editData.description}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              className="w-full bg-[#13151f] border border-border rounded-lg px-4 py-3 text-text-primary focus:border-primary outline-none transition-all resize-none shadow-inner"
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-text-secondary hover:text-text-primary">Cancel</button>
            <button type="submit" className="px-8 py-2.5 bg-primary hover:brightness-110 text-[#0f1117] font-bold rounded-lg transition-all shadow-teal-glow">Update Project</button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} title="Invite Team Member">
        <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          {allUsers.filter(u => !project.members.some(m => m._id === u._id)).map(u => (
            <div key={u._id} className="flex items-center justify-between p-4 bg-[#13151f] rounded-xl border border-border hover:border-primary transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {u.name ? u.name.split(' ').map(n => n[0]).join('') : '?'}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{u.name}</p>
                  <p className="text-[10px] text-text-secondary uppercase font-black tracking-widest">{u.role}</p>
                </div>
              </div>
              <button 
                onClick={() => handleAddMember(u._id)}
                className="px-5 py-2 bg-primary text-[#0f1117] text-[10px] font-black uppercase rounded shadow-teal-glow hover:scale-105 transition-all"
              >
                Add
              </button>
            </div>
          ))}
          {allUsers.filter(u => !project.members.some(m => m._id === u._id)).length === 0 && (
            <div className="py-12 text-center space-y-3">
              <UsersIcon className="w-12 h-12 text-border mx-auto" />
              <p className="text-text-secondary font-bold text-sm">No more members to invite.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
