import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import { Target, Zap, ShieldCheck, MessageCircle, Sparkles, CheckCircle2, MapPin } from 'lucide-react';

const AnimatedOrb = () => {
  return (
    <Canvas camera={{ position: [0, 0, 3] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#00c6ff" />
      <directionalLight position={[-10, -10, -5]} intensity={1} color="#7b5ea7" />
      <Sphere args={[1, 100, 200]} scale={1.2}>
        <MeshDistortMaterial
          color="#04060f"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Canvas>
  );
};

const FounderSection = () => {
  const whyWorkWithMe = [
    "Direct communication — no middle layers, no delays",
    "Faster delivery — decisions made instantly",
    "Affordable pricing — no agency overhead",
    "Custom solutions — built specifically for your needs",
    "Milestone-based — you only pay as work progresses"
  ];

  const howIWork = [
    { title: "Requirement Discussion", desc: "WhatsApp or email call to understand goals." },
    { title: "Design & Development", desc: "Crafting the visual and technical foundation." },
    { title: "Demo & Milestone 1", desc: "40% payment after you see and approve the demo." },
    { title: "Final Delivery", desc: "Remaining payment and full project handover." }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
      <div className="space-y-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Built by One Developer. Delivered with Full Commitment.</h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            I am an independent full stack developer building modern websites and web applications. Every project is personally designed, developed, and delivered — with full attention to quality, performance, and your business goals.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="text-[#00c6ff] w-5 h-5" />
            Why Work With Me
          </h3>
          <ul className="space-y-4">
            {whyWorkWithMe.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-300">
                <span className="text-[#00c6ff] mt-1">✦</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="text-[#7b5ea7] w-5 h-5" />
            How I Work
          </h3>
          <div className="space-y-6">
            {howIWork.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-[#00c6ff]">
                  {i + 1}
                </div>
                <div>
                  <h4 className="font-bold text-white">{step.title}</h4>
                  <p className="text-sm text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6">
          {[
            { icon: "🔒", text: "Handled personally by the founder" },
            { icon: "💰", text: "Transparent pricing, no hidden fees" },
            { icon: "🏗️", text: "Milestone-based — pay as you see" }
          ].map((card, i) => (
            <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
              <span className="text-2xl mb-2 block">{card.icon}</span>
              <p className="text-xs text-gray-400 font-medium leading-tight">{card.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky top-24">
        <motion.div 
          whileHover={{ y: -5 }}
          className="relative bg-gradient-to-tr from-[#1a1f36] to-[#04060f] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden group"
        >
          {/* Background effects */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#00c6ff]/10 rounded-full blur-[100px] group-hover:bg-[#00c6ff]/20 transition-colors"></div>
          
          <div className="relative flex flex-col items-center text-center">
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#00c6ff] to-[#7b5ea7] p-1 mb-8 shadow-[0_0_40px_rgba(0,198,255,0.3)]">
              <div className="w-full h-full rounded-full bg-[#04060f] flex items-center justify-center text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#00c6ff] to-[#7b5ea7]">
                VB
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <h3 className="text-3xl font-bold text-white">M Siddhartha Reddy</h3>
              <p className="text-xl text-[#00c6ff] font-medium">Founder & Full Stack Developer</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Available for Projects
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {['React', 'Node.js', 'MongoDB', 'Three.js', 'Python'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">
                  {tag}
                </span>
              ))}
            </div>

            <div className="w-full space-y-4">
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                <MapPin size={14} className="text-[#00c6ff]" />
                Visakhapatnam, AP
              </div>
              <a 
                href="https://wa.me/918328182328?text=Hi%20M%20Siddhartha%20Reddy%2C%20I%20want%20to%20discuss%20a%20project"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-white text-black font-bold py-4 rounded-2xl transition-all shadow-[0_10px_20px_rgba(37,211,102,0.2)]"
              >
                <MessageCircle size={20} className="fill-current" />
                Start a Conversation &rarr;
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const About = () => {
  const values = [
    { icon: <Target className="w-6 h-6" />, title: 'Direct Access', desc: 'No project managers or middle layers. Talk directly to the builder.' },
    { icon: <Zap className="w-6 h-6" />, title: 'Speed of Thought', desc: 'Rapid prototyping and deployment with zero agency overhead.' },
    { icon: <ShieldCheck className="w-6 h-6" />, title: 'Full Accountability', desc: 'Every line of code is written personally with absolute quality.' },
    { icon: <Sparkles className="w-6 h-6" />, title: 'Custom Built', desc: 'No templates. Every solution is handcrafted for your business.' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
    >
      {/* Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-32">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            We <span className="text-[#00c6ff]">build</span> with intent
          </h1>
          <p className="text-gray-400 text-lg mb-6 leading-relaxed">
            Founded by M Siddhartha Reddy, VB Software Solutions was born from a desire to cut through the noise of traditional agencies and provide businesses with high-quality, high-impact digital solutions through direct developer collaboration.
          </p>
          <p className="text-gray-400 text-lg leading-relaxed">
            My mission is simple: to deliver exceptional digital experiences that drive growth, streamline operations, and elevate brands globally—one project at a time.
          </p>
        </div>
        <div className="h-[400px] w-full relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-white/5 to-transparent border border-white/10 flex items-center justify-center">
          <AnimatedOrb />
        </div>
      </div>

      {/* Core Values */}
      <div className="mb-32">
        <h2 className="text-3xl font-bold mb-10 text-center">The Approach</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#00c6ff]/30 transition-all group">
              <div className="text-[#00c6ff] mb-6 group-hover:scale-110 transition-transform origin-left">{val.icon}</div>
              <h3 className="text-xl font-bold mb-2">{val.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Founder Section */}
      <FounderSection />
    </motion.div>
  );
};

export default About;
