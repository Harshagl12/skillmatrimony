import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
  Plus,
  Sun,
  Moon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../lib/analytics';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const Profile = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

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
  const [saveError, setSaveError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
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

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    trackEvent('profile_save', { name: formData.name });

    try {
      const profileData = {
        id: user.id,
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
        avatar_url: formData.avatarUrl || '',
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) throw error;
      setSupabaseConnected(true);
      setSaved(true);
      setSaveError(null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setSaveError(error?.message || 'Failed to save profile. Check your connection.');
      setSaved(true);
    } finally {
      setSaving(false);
      setTimeout(() => { setSaved(false); setSaveError(null); }, 4000);
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Theme-aware style helpers
  const cardBg = isDark
    ? 'bg-[#0f1115] border-white/[0.05] shadow-[0_8px_30px_rgb(0,0,0,0.12)]'
    : 'bg-white/40 backdrop-blur-xl border-violet-200/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)]';
  const inputStyle = isDark
    ? 'bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus:border-violet-500/50'
    : 'bg-white/70 border-violet-200/40 text-gray-900 placeholder:text-gray-400 focus:border-violet-500';
  const labelColor = isDark ? 'text-zinc-500' : 'text-gray-500';
  const headingColor = isDark ? 'text-white' : 'text-gray-900';
  const subText = isDark ? 'text-zinc-400' : 'text-gray-500';
  const accentColor = isDark ? 'text-violet-500' : 'text-violet-600';

  return (
    <div className="max-w-[1400px] mx-auto min-h-screen pb-20">
      <header className="mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-4xl font-bold mb-2 tracking-tight ${headingColor}`}
        >
          Student <span className={accentColor}>Profile</span>
        </motion.h2>
        <div className="flex items-center gap-4">
          <p className={subText}>Manage your academic identity and portfolio.</p>
          <div className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full transition-colors ${supabaseConnected
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : isDark
              ? 'bg-zinc-800 text-zinc-500 border border-white/5'
              : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}>
            {supabaseConnected ? <Cloud size={12} /> : <CloudOff size={12} />}
            {supabaseConnected ? 'Synced' : 'Local Mode'}
          </div>
        </div>
      </header>

      {loadingProfile ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className={`animate-spin ${accentColor}`} size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column: Avatar & Quick Stats */}
          <div className="md:col-span-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`${cardBg} border rounded-[2rem] p-8 text-center flex flex-col items-center transition-all`}
            >
              <div className="relative mb-6 group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <div className={`size-40 rounded-full p-1 ${isDark
                  ? 'bg-gradient-to-br from-violet-600 to-indigo-700'
                  : 'bg-gradient-to-br from-violet-500 to-purple-600'
                  }`}>
                  <div className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden ${isDark ? 'bg-zinc-950' : 'bg-white'
                    }`}>
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : formData.name ? (
                      <span className={`text-4xl font-bold ${isDark ? 'text-violet-400' : 'text-violet-600'
                        }`}>
                        {getInitials(formData.name)}
                      </span>
                    ) : (
                      <User className={accentColor} size={64} />
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>

              <h3 className={`text-2xl font-bold mb-1 ${headingColor}`}>{formData.name || 'Student Name'}</h3>
              <p className={`text-sm mb-6 ${subText}`}>{formData.branch} • {formData.semester}</p>

              <div className={`w-full h-px mb-6 ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />

              <div className="w-full space-y-4">
                <div className={`flex items-center gap-3 text-sm ${subText}`}>
                  <Mail size={16} className={accentColor} />
                  <span className="truncate">{formData.email}</span>
                </div>
                <div className={`flex items-center gap-3 text-sm ${subText}`}>
                  <Building size={16} className={accentColor} />
                  <span className="truncate">{formData.college || 'College Not Set'}</span>
                </div>
              </div>
            </motion.div>

            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`${cardBg} border rounded-[2rem] p-8 transition-colors`}
            >
              <h4 className={`font-bold mb-4 flex items-center gap-2 ${headingColor}`}>
                <FileText size={18} className={accentColor} /> Bio
              </h4>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us a bit about yourself..."
                className={`w-full border rounded-2xl p-4 text-sm focus:outline-none resize-none h-32 transition-colors ${inputStyle}`}
              />
            </motion.div>

            {/* 🌗 Theme Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`${cardBg} border rounded-[2rem] p-8 transition-colors`}
            >
              <h4 className={`font-bold mb-4 flex items-center gap-2 ${headingColor}`}>
                {isDark
                  ? <Moon size={18} className="text-violet-500" />
                  : <Sun size={18} className="text-violet-500" />
                }
                Appearance
              </h4>
              <div className={`flex items-center justify-between p-4 rounded-xl transition-colors ${isDark ? 'bg-black/20 border border-white/10' : 'bg-white/40 border border-violet-100'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl transition-all ${isDark ? 'bg-violet-500/10' : 'bg-amber-50'
                    }`}>
                    {isDark ? (
                      <Moon size={20} className="text-violet-400" />
                    ) : (
                      <Sun size={20} className="text-violet-500" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${headingColor}`}>
                      {isDark ? 'Dark Mode' : 'Light Mode'}
                    </p>
                    <p className={`text-xs ${subText}`}>
                      {isDark ? 'Violet & deep blue theme' : 'Gradient purple & white theme'}
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  id="theme-toggle-button"
                  onClick={toggleTheme}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark
                    ? 'bg-violet-600 focus:ring-violet-500 focus:ring-offset-zinc-900'
                    : 'bg-violet-500 focus:ring-violet-500 focus:ring-offset-white'
                    }`}
                  aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md transform transition-transform duration-300 ${isDark ? 'translate-x-8' : 'translate-x-1'
                      }`}
                  >
                    {isDark ? (
                      <Moon size={11} className="text-violet-600" />
                    ) : (
                      <Sun size={11} className="text-violet-600" />
                    )}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Form Fields */}
          <div className="md:col-span-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={`${cardBg} border rounded-[2rem] p-8 md:p-10 transition-colors`}
            >
              <h3 className={`text-xl font-bold mb-6 ${headingColor}`}>Academic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`${labelColor} text-sm font-medium`}>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full border rounded-2xl px-4 py-3 focus:outline-none transition-colors ${inputStyle}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`${labelColor} text-sm font-medium`}>Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className={`w-full border rounded-2xl px-4 py-3 cursor-not-allowed ${isDark ? 'bg-black/40 border-white/5 text-zinc-500' : 'bg-gray-100 border-gray-200 text-gray-400'
                      }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`${labelColor} text-sm font-medium`}>College Name</label>
                  <input
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className={`w-full border rounded-2xl px-4 py-3 focus:outline-none transition-colors ${inputStyle}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`${labelColor} text-sm font-medium`}>University</label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    placeholder="e.g. VTU"
                    className={`w-full border rounded-2xl px-4 py-3 focus:outline-none transition-colors ${inputStyle}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`${labelColor} text-sm font-medium`}>Branch</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className={`w-full border rounded-2xl px-4 py-3 focus:outline-none transition-colors appearance-none ${inputStyle}`}
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
                  <label className={`${labelColor} text-sm font-medium`}>Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className={`w-full border rounded-2xl px-4 py-3 focus:outline-none transition-colors appearance-none ${inputStyle}`}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={`${sem}${sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'} Semester`}>
                        {sem}{sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'} Semester
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className={`${cardBg} border rounded-[2rem] p-8 transition-colors`}
            >
              <h3 className={`text-xl font-bold mb-6 ${headingColor}`}>Skills & Socials</h3>

              <div className="mb-8">
                <label className={`${labelColor} text-sm font-medium mb-2 block`}>Skills</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                    placeholder="Add a skill (e.g. React, Python)"
                    className={`flex-1 border rounded-2xl px-4 py-2 focus:outline-none transition-colors ${inputStyle}`}
                  />
                  <button
                    onClick={addSkill}
                    className={`p-3 rounded-2xl transition-colors ${isDark
                      ? 'bg-violet-600/20 text-violet-400 hover:bg-violet-600 hover:text-white'
                      : 'bg-violet-600/10 text-violet-600 hover:bg-violet-600 hover:text-white'
                      }`}
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map(skill => (
                    <span key={skill} className={`px-3 py-1 border rounded-full text-sm flex items-center gap-2 group transition-colors ${isDark
                      ? 'bg-white/5 border-white/10 text-zinc-300 hover:border-red-500/50'
                      : 'bg-white/50 border-violet-200/30 text-gray-700 hover:border-red-400'
                      }`}>
                      {skill}
                      <button onClick={() => removeSkill(skill)} className={`transition-colors ${isDark ? 'text-zinc-500 group-hover:text-red-400' : 'text-gray-400 group-hover:text-red-500'
                        }`}>
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  {formData.skills.length === 0 && (
                    <span className={`text-sm italic ${isDark ? 'text-zinc-600' : 'text-gray-400'}`}>No skills added yet.</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`${labelColor} text-sm font-medium flex items-center gap-2`}>
                    <Linkedin size={16} className="text-[#0a66c2]" /> LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className={`w-full border rounded-2xl px-4 py-3 focus:outline-none transition-colors ${inputStyle}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`${labelColor} text-sm font-medium flex items-center gap-2`}>
                    <Github size={16} /> GitHub URL
                  </label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    placeholder="https://github.com/username"
                    className={`w-full border rounded-2xl px-4 py-3 focus:outline-none transition-colors ${inputStyle}`}
                  />
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col items-end gap-3">
              {saveError && (
                <div className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  ⚠️ {saveError}
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className={`px-8 py-3.5 font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg ${saved
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 text-white'
                  : isDark
                    ? 'bg-violet-600 hover:bg-violet-500 shadow-violet-500/20 text-white'
                    : 'bg-violet-600 hover:bg-violet-500 shadow-violet-500/20 text-white'
                  } disabled:opacity-50`}
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
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
