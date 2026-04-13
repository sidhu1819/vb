import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Code2 } from 'lucide-react';
import api from '../utils/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const categories = ['All', 'Websites', 'E-Commerce', 'Web Apps'];
  const filteredProjects = filter === 'All' ? projects : projects.filter(p => p.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Portfolio</h1>
        <p className="text-gray-400 text-lg">
          Explore some of our recent work across various industries and technologies.
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-4 mb-16">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              filter === cat
                ? 'bg-[#00c6ff] text-[#04060f]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center text-[#00c6ff] pt-10">Loading projects...</div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={project._id}
                className="group relative bg-[#04060f] border border-white/10 rounded-2xl overflow-hidden hover:border-[#7b5ea7] transition-colors flex flex-col"
               >
                <div className="aspect-video bg-white/5 flex items-center justify-center text-6xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04060f] to-transparent opacity-60 z-10" />
                  <span className="relative z-0 group-hover:scale-110 transition-transform duration-500">{project.thumbnail}</span>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#00c6ff]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center gap-4">
                    <button className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"><ExternalLink className="w-5 h-5" /></button>
                    <button className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"><Code2 className="w-5 h-5" /></button>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-sm text-[#00c6ff] font-medium mb-2">{project.category}</div>
                  <h3 className="text-xl font-bold mb-3">{project.title}</h3>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2 h-10">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.techStack.map((tech, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-md bg-white/5 text-gray-300 border border-white/10">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default Projects;
