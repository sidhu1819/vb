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
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden -mt-20 pt-20 flex flex-col justify-end pb-32">
        <HeroScene scrollYProgress={scrollYProgress} />

        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#04060f] to-transparent pointer-events-none z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 text-center w-full">
          <motion.h1 className="text-4xl md:text-6xl font-extrabold text-white">
            We Build Modern
          </motion.h1>

          <motion.h1 className="text-5xl md:text-7xl font-extrabold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00c6ff] via-[#7b5ea7] to-[#00c6ff]">
              Websites for Businesses
            </span>
          </motion.h1>
        </div>
      </section>

      {/* 🔥 UPDATED PORTFOLIO BOX (REPLACED STATS) */}
      <section className="relative z-20 -mt-10 mb-20">
        <div className="max-w-5xl mx-auto px-4">

          <motion.a
            href="https://github.com/sidhu1819/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="group block p-10 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#00c6ff]/60 transition-all hover:-translate-y-2 text-center shadow-2xl"
          >

            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00c6ff]/20 to-[#7b5ea7]/20 opacity-0 group-hover:opacity-100 blur-2xl transition-all rounded-3xl"></div>

            <div className="relative z-10">

              <div className="mb-6 inline-block p-5 bg-white/5 rounded-2xl group-hover:scale-110 transition">
                <Monitor className="w-10 h-10 text-[#00c6ff]" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Explore My Portfolio 🚀
              </h2>

              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Discover my real-world projects, modern UI designs, and AI-powered web applications built with performance and scalability.
              </p>

              <span className="inline-flex items-center gap-2 text-[#00c6ff] font-semibold group-hover:text-white transition">
                View Portfolio
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>

            </div>
          </motion.a>

        </div>
      </section>

      {/* Services Section (UNCHANGED) */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <motion.div variants={fadeIn} className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Our Expertise</h2>
          <p className="text-gray-400">We provide end-to-end web development services.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((svc, i) => (
            <motion.div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10">
              {svc.icon}
              <h3 className="text-xl font-bold mt-4">{svc.title}</h3>
              <p className="text-gray-400">{svc.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

    </motion.div>
  );
};

export default Home;