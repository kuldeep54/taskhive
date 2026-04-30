import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FolderKanban, 
  Users, 
  CheckSquare,
  Loader2,
  X
} from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Create Project Form State
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    members: []
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    document.title = 'Projects | TaskHive';
    fetchProjects();
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch (error) {
      toast.error('Failed to fetch projects');
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

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.title) {
      toast.error('Project title is required');
      return;
    }

    setCreating(true);
    try {
      const { data } = await API.post('/projects', newProject);
      setProjects([data, ...projects]);
      toast.success('Project created successfully!');
      setIsModalOpen(false);
      setNewProject({ title: '', description: '', members: [] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const toggleMember = (userId) => {
    setNewProject(prev => {
      const isSelected = prev.members.includes(userId);
      return {
        ...prev,
        members: isSelected 
          ? prev.members.filter(id => id !== userId)
          : [...prev.members, userId]
      };
    });
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Projects</h1>
          <p className="text-text-secondary mt-1">{projects.length} projects total</p>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:brightness-110 text-[#0f1117] font-bold rounded-lg transition-all transform active:scale-95 shadow-teal-glow"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Search projects..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-lg pl-12 pr-4 py-3 text-text-primary focus:border-primary outline-none transition-all shadow-sm"
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div 
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}`)}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary transition-all cursor-pointer group flex flex-col h-full shadow-sm hover:shadow-teal-glow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors truncate pr-4">
                  {project.title}
                </h3>
                <span className="badge badge-done uppercase tracking-widest text-[9px] font-black">Active</span>
              </div>
              
              <p className="text-sm text-text-secondary line-clamp-2 mb-6 flex-1 italic">
                {project.description || 'No description provided.'}
              </p>

              <div className="border-t border-border pt-4 mt-auto">
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 3).map((member, i) => (
                      <div 
                        key={member._id}
                        className="w-8 h-8 rounded-full bg-[#13151f] border-2 border-card flex items-center justify-center text-[10px] font-black text-primary uppercase"
                        title={member.name}
                      >
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    ))}
                    {project.members.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-[#13151f] border-2 border-card flex items-center justify-center text-[9px] font-black text-text-secondary">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-text-secondary uppercase">
                    <CheckSquare className="w-4 h-4" />
                    {project.taskCount || 0} Tasks
                  </div>
                </div>
                <p className="text-[9px] text-text-secondary mt-3 uppercase tracking-widest font-black opacity-60">
                  by {project.createdBy.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start organizing tasks and collaborating with your team."
          actionText="Create Project"
          onAction={() => setIsModalOpen(true)}
          isAdmin={user?.role === 'admin'}
        />
      )}

      {/* Create Project Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-text-secondary uppercase tracking-widest">Project Title</label>
            <input 
              type="text" 
              required
              value={newProject.title}
              onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              className="w-full h-11 bg-[#13151f] border border-border rounded-lg px-4 text-text-primary focus:border-primary outline-none transition-all shadow-inner"
              placeholder="e.g. Website Redesign 2026"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-text-secondary uppercase tracking-widest">Description</label>
            <textarea 
              rows="3"
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              className="w-full bg-[#13151f] border border-border rounded-lg px-4 py-3 text-text-primary focus:border-primary outline-none transition-all resize-none shadow-inner"
              placeholder="What is this project about?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-text-secondary uppercase tracking-widest">Add Members</label>
            <div className="bg-[#13151f] border border-border rounded-lg p-3 max-h-40 overflow-y-auto custom-scrollbar space-y-1 shadow-inner">
              {allUsers.filter(u => u._id !== user?._id).map(u => (
                <div 
                  key={u._id}
                  onClick={() => toggleMember(u._id)}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                    newProject.members.includes(u._id) ? 'bg-primary/10' : 'hover:bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-[10px] font-black text-text-secondary uppercase">
                      {u.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">{u.name}</p>
                      <p className="text-[9px] text-text-secondary uppercase font-black tracking-widest">{u.role}</p>
                    </div>
                  </div>
                  {newProject.members.includes(u._id) && (
                    <div className="w-2 h-2 bg-primary rounded-full shadow-teal-glow"></div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Selected Member Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {newProject.members.map(memberId => {
                const m = allUsers.find(u => u._id === memberId);
                return m ? (
                  <span key={memberId} className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase rounded border border-primary/20 tracking-wider">
                    {m.name}
                    <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => toggleMember(memberId)} />
                  </span>
                ) : null;
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 text-[11px] font-black text-text-secondary hover:text-text-primary uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 px-8 py-2.5 bg-primary hover:brightness-110 text-[#0f1117] font-black text-[11px] uppercase tracking-widest rounded-lg transition-all disabled:opacity-50 shadow-teal-glow"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
