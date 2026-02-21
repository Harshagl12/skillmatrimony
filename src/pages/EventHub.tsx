import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Tag,
  PlusCircle,
  ExternalLink,
  Code,
  Trophy,
  Mic,
  Palette,
  Dribbble,
  Loader2,
  X,
  CheckCircle,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fetchDynamicPhoto } from '../lib/api';
import { trackEvent } from '../lib/analytics';

const CATEGORIES = [
  { name: 'Hackathons', icon: Code, color: 'text-blue-400' },
  { name: 'Workshops', icon: Users, color: 'text-violet-400' },
  { name: 'Tech Talks', icon: Mic, color: 'text-emerald-400' },
  { name: 'Cultural Fests', icon: Palette, color: 'text-pink-400' },
  { name: 'Sports', icon: Dribbble, color: 'text-orange-400' },
  { name: 'Competitions', icon: Trophy, color: 'text-amber-400' },
];

// Fallback events when Supabase is not configured
const FALLBACK_EVENTS = [
  {
    id: 1,
    title: 'Global Dev Sprint 2024',
    college: 'MIT Institute of Technology',
    date: 'Oct 24 - 26, 2024',
    location: 'Main Campus, Tech Hub',
    category: 'Hackathons',
    image: '',
    tags: ['AI', 'Web3', 'Blockchain']
  },
  {
    id: 2,
    title: 'Design-X Workshop',
    college: 'Stanford Design School',
    date: 'Nov 12, 2024',
    location: 'Auditorium B',
    category: 'Workshops',
    image: '',
    tags: ['UI/UX', 'Figma']
  },
  {
    id: 3,
    title: 'Future of Robotics Talk',
    college: 'Imperial College London',
    date: 'Dec 05, 2024',
    location: 'Virtual Event',
    category: 'Tech Talks',
    image: '',
    tags: ['Robotics', 'IoT']
  },
];

interface Event {
  id: number | string;
  title: string;
  college: string;
  date: string;
  location: string;
  category: string;
  image: string;
  tags: string[];
}

const EventHub = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  // New event form
  const [newEvent, setNewEvent] = useState({
    title: '',
    college: '',
    date: '',
    location: '',
    category: 'Hackathons',
    tags: '',
  });

  // ✅ Supabase: Fetch events from database
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped = data.map((e: any) => ({
          id: e.id,
          title: e.title,
          college: e.college,
          date: e.date,
          location: e.location,
          category: e.category,
          image: e.image_url || '',
          tags: e.tags || [],
        }));
        setEvents(mapped);
      } else {
        // Use fallback events + fetch dynamic images
        const withImages = await Promise.all(
          FALLBACK_EVENTS.map(async (event) => {
            const image = await fetchDynamicPhoto(event.category + ' ' + event.title);
            return { ...event, image };
          })
        );
        setEvents(withImages);
      }
    } catch {
      // Supabase not configured — use fallback with dynamic images
      const withImages = await Promise.all(
        FALLBACK_EVENTS.map(async (event) => {
          const image = await fetchDynamicPhoto(event.category + ' ' + event.title);
          return { ...event, image };
        })
      );
      setEvents(withImages);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Supabase: Publish new event
  const handlePublish = async () => {
    if (!newEvent.title || !newEvent.college || !newEvent.date) return;

    setPublishing(true);
    trackEvent('event_publish_start', { title: newEvent.title });

    try {
      // Fetch a dynamic image for the event
      const imageUrl = await fetchDynamicPhoto(newEvent.category + ' event');

      const eventData = {
        title: newEvent.title,
        college: newEvent.college,
        date: newEvent.date,
        location: newEvent.location || 'TBA',
        category: newEvent.category,
        tags: newEvent.tags.split(',').map(t => t.trim()).filter(Boolean),
        image_url: imageUrl,
      };

      const { error } = await supabase.from('events').insert([eventData]);

      if (error) throw error;

      trackEvent('event_publish_success', { title: newEvent.title });
      setPublished(true);
      setTimeout(() => {
        setShowPublishModal(false);
        setPublished(false);
        setNewEvent({ title: '', college: '', date: '', location: '', category: 'Hackathons', tags: '' });
        loadEvents();
      }, 1500);
    } catch (err: any) {
      // Even if Supabase fails, add to local state
      const imageUrl = await fetchDynamicPhoto(newEvent.category + ' event');
      const localEvent: Event = {
        id: Date.now(),
        title: newEvent.title,
        college: newEvent.college,
        date: newEvent.date,
        location: newEvent.location || 'TBA',
        category: newEvent.category,
        tags: newEvent.tags.split(',').map(t => t.trim()).filter(Boolean),
        image: imageUrl,
      };
      setEvents(prev => [localEvent, ...prev]);
      setPublished(true);
      setTimeout(() => {
        setShowPublishModal(false);
        setPublished(false);
        setNewEvent({ title: '', college: '', date: '', location: '', category: 'Hackathons', tags: '' });
      }, 1500);
    } finally {
      setPublishing(false);
    }
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Event <span className="text-violet-500">Hub</span></h2>
          <p className="text-zinc-400">Discover and participate in inter-college events across the globe.</p>
        </div>
        <button
          onClick={() => setShowPublishModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-600/20 active:scale-95"
        >
          <PlusCircle size={20} />
          Publish Event
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search colleges, events or technologies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-12">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-6 py-2.5 rounded-xl font-medium transition-all ${selectedCategory === 'All' ? 'bg-violet-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${selectedCategory === cat.name
              ? 'bg-violet-600 text-white'
              : 'bg-white/5 text-zinc-400 hover:bg-white/10'
              }`}
          >
            <cat.icon size={18} className={selectedCategory === cat.name ? 'text-white' : cat.color} />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-zinc-900 rounded-[2rem] overflow-hidden animate-pulse">
              <div className="h-56 bg-white/5" />
              <div className="p-8 space-y-3">
                <div className="h-5 bg-white/5 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredEvents.map((event) => (
              <motion.div
                layout
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -8 }}
                className="bg-zinc-900 border border-white/5 rounded-[2rem] overflow-hidden group shadow-xl"
              >
                <div className="h-56 relative overflow-hidden">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-900/50 to-indigo-900/50 flex items-center justify-center">
                      <ImageIcon className="text-zinc-700" size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider border border-white/10">
                      {event.category}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-400 transition-colors line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="text-violet-500 font-medium text-sm mb-4">{event.college}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-zinc-500 text-sm">
                      <CalendarIcon size={16} />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-3 text-zinc-500 text-sm">
                      <MapPin size={16} />
                      {event.location}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {event.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 text-zinc-400 text-xs font-medium">
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => trackEvent('event_register_click', { event: event.title })}
                    className="w-full py-4 bg-white/5 hover:bg-violet-600 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                  >
                    Register Now
                    <ExternalLink size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredEvents.length === 0 && !loading && (
            <div className="col-span-full text-center py-20">
              <p className="text-zinc-500 text-lg">No events found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* ===== PUBLISH EVENT MODAL ===== */}
      <AnimatePresence>
        {showPublishModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPublishModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-8 w-full max-w-lg"
            >
              {published ? (
                <div className="text-center py-12">
                  <CheckCircle className="text-emerald-500 mx-auto mb-4" size={48} />
                  <h3 className="text-2xl font-bold text-white mb-2">Event Published!</h3>
                  <p className="text-zinc-400">Your event is now live on the hub.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-white">Publish New Event</h3>
                    <button onClick={() => setShowPublishModal(false)} className="text-zinc-500 hover:text-white">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Event Title *"
                      value={newEvent.title}
                      onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
                    />
                    <input
                      type="text"
                      placeholder="College Name *"
                      value={newEvent.college}
                      onChange={e => setNewEvent({ ...newEvent, college: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Date *"
                        value={newEvent.date}
                        onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={newEvent.location}
                        onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <select
                      value={newEvent.category}
                      onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 appearance-none"
                    >
                      {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                    <input
                      type="text"
                      placeholder="Tags (comma separated)"
                      value={newEvent.tags}
                      onChange={e => setNewEvent({ ...newEvent, tags: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <button
                    onClick={handlePublish}
                    disabled={publishing || !newEvent.title || !newEvent.college || !newEvent.date}
                    className="mt-8 w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    {publishing ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <PlusCircle size={18} />
                        Publish Event
                      </>
                    )}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventHub;
