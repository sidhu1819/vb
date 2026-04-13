import { motion, useScroll } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Monitor } from 'lucide-react';
import HeroScene from '../components/Hero3D/HeroScene';

const Home = () => {
  const { scrollYProgress } = useScroll();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const services = [
    { icon: <Monitor className="w-8 h-8 text-[#00c6ff]" />, title: 'Modern Websites', desc: 'Fast, responsive, and beautiful websites built with React and Tailwind.' },
    { icon: <Zap className="w-8 h-8 text-[#00c6ff]" />, title: 'Web Applications', desc: 'Complex logic, robust backends, and seamless user experiences.' },
    { icon: <Shield className="w-8 h-8 text-[#00c6ff]" />, title: 'Secure & Scalable', desc: 'Enterprise-grade architecture ready to grow with your business.' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative"
    >
      {/* 3D Hero Section */}
      <section className="relative h-screen overflow-hidden -mt-20 pt-20 flex flex-col justify-end pb-32">
        <HeroScene scrollYProgress={scrollYProgress} />

        {/* HTML Gradient Mask at Bottom */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#04060f] to-transparent pointer-events-none z-10" />

        {/* Text Overlay */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pointer-events-none w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 inline-block"
          >
            <span className="py-2 px-4 rounded-full bg-[#00c6ff]/10 text-[#00c6ff] text-xs font-bold uppercase tracking-wider border border-[#00c6ff]/30 backdrop-blur-md">
              ✦ Modern Web Solutions ✦
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-6xl font-extrabold mb-2 text-white pointer-events-auto"
          >
            We Build Modern
          </motion.h1>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 pointer-events-auto"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00c6ff] via-[#7b5ea7] to-[#00c6ff] animate-gradient">
              Websites for Businesses
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto pointer-events-auto"
          >
            VB Software Solutions — crafting blazing-fast, conversion-focused digital experiences.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto"
          >
            <Link to="/contact" className="px-8 py-4 rounded-full bg-[#00c6ff] text-[#04060f] font-bold text-lg hover:shadow-[0_0_20px_#00c6ff50] hover:scale-105 transition-all flex items-center justify-center gap-2 group">
              Start Your Project
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/projects" className="px-8 py-4 rounded-full bg-white/5 text-white font-bold text-lg hover:bg-white/10 hover:border-white/30 transition-all border border-white/10 backdrop-blur-sm">
              Explore Our Work
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="relative z-20 -mt-10 mb-20 pointer-events-auto">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-center shadow-2xl">
            {[
              { label: 'Completed Projects', value: '20+' },
              { label: 'Client Satisfaction', value: '98%' },
              { label: 'Expert Developers', value: '15+' },
              { label: 'Years Experience', value: '5+' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Our Expertise</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">We provide end-to-end web development services to help your business thrive online.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((svc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-8 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 hover:border-[#00c6ff]/50 transition-all hover:-translate-y-2 group"
            >
              <div className="mb-6 p-4 bg-white/5 rounded-xl inline-block group-hover:scale-110 transition-transform">
                {svc.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{svc.title}</h3>
              <p className="text-gray-400">{svc.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/services" className="inline-flex items-center gap-2 text-[#00c6ff] hover:text-white transition-colors font-medium">
            See all services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00c6ff]/20 to-[#7b5ea7]/20 opacity-50" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to start your next project?</h2>
          <p className="text-xl text-gray-300 mb-10">Let's build something amazing together. Get in touch for a free consultation.</p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-[#04060f] font-bold text-lg hover:scale-105 transition-transform">
            Contact Us Today
          </Link>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
