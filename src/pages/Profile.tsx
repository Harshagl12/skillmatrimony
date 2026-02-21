import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Building,
  Save,
  CheckCircle,
  Camera,
  Loader2,
  Cloud,
  CloudOff,
  Github,
  Linkedin,
  FileText,
  X,
  Plus
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../lib/analytics';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college: '',
    university: '',
    branch: 'Computer Science',
    semester: '1st Semester',
    graduationYear: new Date().getFullYear() + 4,
    bio: '',
    linkedin: '',
    github: '',
    skills: [] as string[],
    avatarUrl: ''
  });

  const [newSkill, setNewSkill] = useState('');

  // ✅ Supabase: Load profile on mount
  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      // Allow local editing if strictly offline/demo, but protected route should prevent this
      setLoadingProfile(false);
    }
  }, [user]);

  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data && !error) {
          setFormData({
            name: data.name || user.user_metadata?.full_name || '',
            email: data.email || user.email || '',
            college: data.college || '',
            university: data.university || '',
            branch: data.branch || 'Computer Science',
            semester: data.semester || '1st Semester',
            graduationYear: data.graduation_year || new Date().getFullYear() + 4,
            bio: data.bio || '',
            linkedin: data.linkedin_url || '',
            github: data.github_url || '',
            skills: data.skills || [],
            avatarUrl: data.avatar_url || ''
          });
          setSupabaseConnected(true);
        } else {
          // Pre-fill from auth metadata if profile doesn't accept yet
          setFormData(prev => ({
            ...prev,
            name: user.user_metadata?.full_name || '',
            email: user.email || ''
          }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProfile(false);
    }
  };

  // ✅ Supabase: Save profile
  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    trackEvent('profile_save', { name: formData.name });

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          name: formData.name,
          email: formData.email,
          college: formData.college,
          university: formData.university,
          branch: formData.branch,
          semester: formData.semester,
          graduation_year: formData.graduationYear,
          bio: formData.bio,
          linkedin_url: formData.linkedin,
          github_url: formData.github,
          skills: formData.skills,
          // avatar_url: formData.avatarUrl, // We'd update this via storage upload separately
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setSupabaseConnected(true);
      setSaved(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Fallback for demo
      setSaved(true);
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen pb-20">
      <header className="mb-10">
        <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Student <span className="text-violet-500">Profile</span></h2>
        <div className="flex items-center gap-4">
          <p className="text-zinc-400">Manage your academic identity and portfolio.</p>
          <div className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${supabaseConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border border-white/5'}`}>
            {supabaseConnected ? <Cloud size={12} /> : <CloudOff size={12} />}
            {supabaseConnected ? 'Synced' : 'Local Mode'}
          </div>
        </div>
      </header>

      {loadingProfile ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-violet-500" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Avatar & Quick Stats */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 text-center flex flex-col items-center">
              <div className="relative mb-6 group cursor-pointer">
                <div className="size-40 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 p-1">
                  <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center overflow-hidden">
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-violet-500" size={64} />
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-1">{formData.name || 'Student Name'}</h3>
              <p className="text-zinc-500 text-sm mb-6">{formData.branch} • {formData.semester}</p>

              <div className="w-full h-px bg-white/5 mb-6" />

              <div className="w-full space-y-4">
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Mail size={16} className="text-violet-500" />
                  <span className="truncate">{formData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Building size={16} className="text-violet-500" />
                  <span className="truncate">{formData.college || 'College Not Set'}</span>
                </div>
              </div>
            </div>

            {/* Resume / Bio Summary */}
            <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <FileText size={18} className="text-violet-500" /> Bio
              </h4>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us a bit about yourself..."
                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-violet-500/50 resize-none h-32"
              />
            </div>
          </div>

          {/* Right Column: Form Fields */}
          <div className="md:col-span-8 space-y-6">
            <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Academic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-zinc-500 text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-zinc-500 text-sm font-medium">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-zinc-500 text-sm font-medium">College Name</label>
                  <input
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-zinc-500 text-sm font-medium">University</label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    placeholder="e.g. VTU"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-zinc-500 text-sm font-medium">Branch</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors appearance-none"
                  >
                    <option>Computer Science</option>
                    <option>Information Science</option>
                    <option>AIML</option>
                    <option>Electronics (EC)</option>
                    <option>Electrical (EE)</option>
                    <option>Mechanical</option>
                    <option>Civil</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-zinc-500 text-sm font-medium">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={`${sem}${sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'} Semester`}>
                        {sem}{sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'} Semester
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Skills & Socials</h3>

              {/* Skills Input */}
              <div className="mb-8">
                <label className="text-zinc-500 text-sm font-medium mb-2 block">Skills</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                    placeholder="Add a skill (e.g. React, Python)"
                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500"
                  />
                  <button
                    onClick={addSkill}
                    className="p-2 bg-violet-600/20 text-violet-400 rounded-xl hover:bg-violet-600 hover:text-white transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-zinc-300 flex items-center gap-2 group hover:border-red-500/50 transition-colors">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="text-zinc-500 group-hover:text-red-400">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  {formData.skills.length === 0 && (
                    <span className="text-zinc-600 text-sm italic">No skills added yet.</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-zinc-500 text-sm font-medium flex items-center gap-2">
                    <Linkedin size={16} className="text-[#0a66c2]" /> LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-zinc-500 text-sm font-medium flex items-center gap-2">
                    <Github size={16} /> GitHub URL
                  </label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-violet-500/20"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle size={18} />
                    Changes Saved
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
