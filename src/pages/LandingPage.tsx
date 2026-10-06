import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  Cpu,
  Layers,
  Zap,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  IndianRupee,
  ShieldCheck,
  Wrench,
  Award,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedTrack, setSelectedTrack] = useState<number>(0);

  const registerTarget = currentUser ? '/register' : '/login?mode=signup';

  const tracks = [
    {
      id: 'design',
      title: 'Components & Schematics',
      icon: Cpu,
      tag: 'Track 01',
      image: '/images/track-design.jpg',
      summary: 'Component testing, schematics, and pin layout intuition',
      description:
        'Learn to identify, test, and understand electronic components — resistors, capacitors, ICs, and voltage regulators. Master schematic capture and pin placement using open-source CAD tools.',
      highlights: [
        'Multimeter & component diagnostics',
        'Datasheets & pinout configurations',
        'Passive & Active IC circuits',
        'Schematic layout & DRC checks',
      ],
    },
    {
      id: 'fab',
      title: 'PCB Foundations & Routing',
      icon: Layers,
      tag: 'Track 02',
      image: '/images/track-fab.jpg',
      summary: 'Copper trace routing, Gerber export, and stackups',
      description:
        'Understand copper-clad laminates, trace width calculations, copper pour, pad placement, and Gerber file generation. Take your schematic and turn it into a production-ready board layout.',
      highlights: [
        'Copper trace width & current density',
        'Ground planes & thermal relief',
        'Gerber X2 export & drill files',
        'Chemical etching & substrate prep',
      ],
    },
    {
      id: 'solder',
      title: 'Assembly & Soldering',
      icon: Zap,
      tag: 'Track 03',
      image: '/images/track-solder.jpg',
      summary: 'Hands-on soldering, component mounting, and live testing',
      description:
        'Hands-on soldering iron control, through-hole component assembly, flux application, and continuity testing. Power up your fabricated circuit and test it live on the bench.',
      highlights: [
        'Through-hole soldering technique',
        'Flux application & desoldering',
        'Continuity & voltage rail checks',
        'Working physical PCB to take home',
      ],
    },
  ];

  const scheduleEvents = [
    { time: '09:30 AM', title: 'Arrival & Student Registration', desc: 'Venue desk check-in & hardware kit distribution' },
    { time: '10:30 AM', title: 'Track 01: Component Diagnostics', desc: 'Hands-on component testing & schematic capture' },
    { time: '12:30 PM', title: 'Track 02: PCB Layout & Trace Routing', desc: 'CAD copper routing, Gerber export, and board prep' },
    { time: '01:30 PM', title: 'Lunch & Networking', desc: 'Interact with mentors and explore sample hardware projects' },
    { time: '02:15 PM', title: 'Track 03: Etching & Precision Soldering', desc: 'Chemical etching, hole drilling, and soldering components' },
    { time: '03:45 PM', title: 'Live Testing & Take-Home Certificate', desc: 'Powering up completed circuits and final Q&A' },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <div className="bg-[#050508] text-white overflow-hidden font-sans">
      {/* 1) HERO SECTION — Full Bleed with hero-pcb Image + Dark Overlay */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-20 overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-pcb.jpg"
            alt="PCB Background"
            className="w-full h-full object-cover object-center scale-105 filter brightness-75 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050508] via-[#050508]/90 to-[#050508]/70 z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050508]/50 to-[#050508] z-10" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#FF2D2D]/20 rounded-full blur-[150px] pointer-events-none z-10" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 z-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Column */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-7 flex flex-col items-start text-left"
            >
              {/* Event Badge */}
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161622]/90 border border-[#2a2a3e] text-xs font-bold uppercase tracking-widest text-[#FF2D2D] mb-6 shadow-xl backdrop-blur-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>EMBEDX PCB WORKSHOP 2026</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D2D] animate-ping" />
              </motion.div>

              {/* Giant Headline */}
              <motion.h1
                variants={itemVariants}
                className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-white"
              >
                CREATE THE <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-[#FF2D2D]">
                  UNIMAGINABLE.
                </span>
              </motion.h1>

              {/* Subcopy */}
              <motion.p
                variants={itemVariants}
                className="text-xl sm:text-2xl font-semibold text-gray-300 mt-6 max-w-xl leading-relaxed"
              >
                Hello PCB. Let's build something real.
              </motion.p>

              {/* Metadata Pills */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center gap-3 mt-8"
              >
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101018]/90 border border-[#242436] text-xs font-medium text-gray-300 backdrop-blur-md">
                  <MapPin className="w-3.5 h-3.5 text-[#FF2D2D]" />
                  Govt Institute of Electronics, Secunderabad
                </span>

                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101018]/90 border border-[#242436] text-xs font-medium text-gray-300 backdrop-blur-md">
                  <Clock className="w-3.5 h-3.5 text-[#FF2D2D]" />
                  9:30 AM – 4:00 PM
                </span>

                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FF2D2D]/15 border border-[#FF2D2D]/30 text-xs font-bold text-[#FF2D2D] backdrop-blur-md">
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>₹70 / student</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-gray-300">
                  1st Year Exclusive
                </span>
              </motion.div>

              {/* CTAs */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 mt-10">
                <Link
                  to={registerTarget}
                  className="btn-pill text-base px-8 py-4 shadow-[0_0_30px_rgba(255,45,45,0.45)] hover:shadow-[0_0_45px_rgba(255,45,45,0.75)]"
                >
                  <span>Register Now</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <a
                  href="#tracks"
                  className="btn-pill-outline text-base px-8 py-4 border-[#2e2e42] hover:border-white"
                >
                  Explore Tracks
                </a>
              </motion.div>
            </motion.div>

            {/* Right Hero Column (Desktop Image Card) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block lg:col-span-5 relative"
            >
              <div className="relative group rounded-3xl overflow-hidden border border-[#2a2a3e] bg-[#0f0f16] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent z-10" />
                <img
                  src="/images/learn-board.jpg"
                  alt="PCB Hardware Fabrication"
                  className="w-full h-[460px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-6 left-6 right-6 z-20 bg-[#0f0f16]/90 backdrop-blur-md p-5 rounded-2xl border border-[#242436]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#FF2D2D] block mb-1">
                        HANDS-ON HARDWARE
                      </span>
                      <h4 className="text-base font-bold text-white">Physical Circuit Fabrication</h4>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#FF2D2D]/20 border border-[#FF2D2D]/40 flex items-center justify-center text-[#FF2D2D]">
                      <Wrench className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2) FEATURES GRID + IMAGE SECTION */}
      <section className="py-20 bg-[#09090f] border-y border-[#181824] relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
          >
            {/* Feature Text & 4 Cards */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <span className="step-badge mb-3">Event Highlights</span>
                <h2 className="section-subheading">
                  From Schematic Capture to Physical Board.
                </h2>
                <p className="text-gray-400 text-base leading-relaxed mt-3 max-w-2xl">
                  An intensive hardware creation workshop designed to turn complete beginners into confident circuit designers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="card-surface p-6 border-[#242436] hover:border-[#FF2D2D]/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#FF2D2D]/10 flex items-center justify-center text-[#FF2D2D] font-black mb-4">
                    01
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1.5">100% Hands-On</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    No dry slides. You receive physical tools, soldering irons, components, and CAD software from minute one.
                  </p>
                </div>

                <div className="card-surface p-6 border-[#242436] hover:border-[#FF2D2D]/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#FF2D2D]/10 flex items-center justify-center text-[#FF2D2D] font-black mb-4">
                    02
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1.5">Hardware Kit Included</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Includes electronic parts, ICs, copper-clad laminate, solder wire, and testing multimeter kit.
                  </p>
                </div>

                <div className="card-surface p-6 border-[#242436] hover:border-[#FF2D2D]/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#FF2D2D]/10 flex items-center justify-center text-[#FF2D2D] font-black mb-4">
                    03
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1.5">Expert Mentorship</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Guided by the EmbedX crew through schematic drawing, trace routing, chemical etching, and debugging.
                  </p>
                </div>

                <div className="card-surface p-6 border-[#242436] hover:border-[#FF2D2D]/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#FF2D2D]/10 flex items-center justify-center text-[#FF2D2D] font-black mb-4">
                    04
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1.5">Take-Home Working Board</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Walk out at 4:00 PM with your custom-built working printed circuit board prototype and certificate.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Paired Image */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-[#2a2a3e] bg-[#0f0f16] shadow-2xl">
                <img
                  src="/images/learn-board.jpg"
                  alt="Hands-On PCB Workshop"
                  className="w-full h-[440px] object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#09090e]/95 border border-[#222234]">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-[#FF2D2D] shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Government Institute of Electronics</h4>
                      <p className="text-xs text-gray-400">Secunderabad · 9:30 AM – 4:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3) TRACKS SECTION WITH IMAGES */}
      <section id="tracks" className="py-24 bg-[#050508] relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <div className="step-badge mb-3">Structured Curriculum</div>
            <h2 className="section-subheading">Choose Your Track</h2>
            <p className="text-gray-400 text-sm sm:text-base mt-3">
              Three focused tracks covering the full spectrum of electronic circuit design and manufacturing.
            </p>
          </motion.div>

          {/* Track Selection Buttons */}
          <div className="flex justify-center gap-3 sm:gap-4 mb-12 flex-wrap">
            {tracks.map((track, idx) => {
              const Icon = track.icon;
              const active = selectedTrack === idx;
              return (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrack(idx)}
                  className={`flex items-center gap-3 px-6 py-3.5 rounded-full text-sm font-bold transition-all duration-300 border ${
                    active
                      ? 'bg-[#FF2D2D] text-white border-[#FF2D2D] shadow-[0_0_25px_rgba(255,45,45,0.45)] scale-105'
                      : 'bg-[#0f0f16] text-gray-400 border-[#242436] hover:text-white hover:border-[#383850]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{track.title}</span>
                </button>
              );
            })}
          </div>

          {/* Track Detail Panel */}
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTrack}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="card-elevated p-8 sm:p-12 relative overflow-hidden border border-[#2a2a3e] bg-[#0f0f16]"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-black uppercase tracking-widest text-[#FF2D2D] bg-[#FF2D2D]/10 px-3 py-1 rounded-full border border-[#FF2D2D]/30">
                        {tracks[selectedTrack].tag}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {tracks[selectedTrack].summary}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-white">
                      {tracks[selectedTrack].title}
                    </h3>

                    <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                      {tracks[selectedTrack].description}
                    </p>

                    <div className="pt-6 border-t border-[#202030]">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                        Key Learning Outcomes
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {tracks[selectedTrack].highlights.map((item, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-sm text-gray-300">
                            <CheckCircle2 className="w-4 h-4 text-[#FF2D2D] shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Track Image Card */}
                  <div className="lg:col-span-5">
                    <div className="rounded-2xl overflow-hidden border border-[#26263a] bg-[#09090e] shadow-lg">
                      <img
                        src={tracks[selectedTrack].image}
                        alt={tracks[selectedTrack].title}
                        className="w-full h-[280px] object-cover object-center"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 4) SCHEDULE STRIP / WORKSHOP HOURS SECTION */}
      <section className="py-20 bg-[#09090f] border-t border-[#181824]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <div className="step-badge mb-3">Single-Day Agenda</div>
            <h2 className="section-subheading">Workshop Schedule</h2>
            <p className="text-gray-400 text-sm sm:text-base mt-2">
              9:30 AM – 4:00 PM · Government Institute of Electronics, Secunderabad
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scheduleEvents.map((ev, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="card-surface p-6 border-[#242436] hover:border-[#FF2D2D]/40 transition-colors"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF2D2D]/10 text-[#FF2D2D] text-xs font-mono font-bold mb-4 border border-[#FF2D2D]/30">
                  <Clock className="w-3 h-3" />
                  <span>{ev.time}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{ev.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{ev.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5) FINAL CTA WITH cta-chips BACKGROUND */}
      <section className="relative py-28 overflow-hidden text-center">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/cta-chips.jpg"
            alt="Microchip background"
            className="w-full h-full object-cover object-center filter brightness-50 contrast-125 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/85 to-[#050508] z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF2D2D]/20 rounded-full blur-[180px] pointer-events-none z-10" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF2D2D]/10 border border-[#FF2D2D]/30 text-xs font-bold uppercase tracking-widest text-[#FF2D2D] mb-6 shadow-xl backdrop-blur-md">
              <Award className="w-3.5 h-3.5" />
              <span>LIMITED SEATS AVAILABLE</span>
            </div>

            <h2 className="section-heading">Ready to build?</h2>
            <p className="text-lg text-gray-300 mt-4 max-w-md mx-auto leading-relaxed">
              Reserve your spot today and start your hardware creation journey with EmbedX.
            </p>

            <div className="mt-10">
              <Link
                to={registerTarget}
                className="btn-pill text-lg px-10 py-4 shadow-[0_0_35px_rgba(255,45,45,0.5)] hover:shadow-[0_0_55px_rgba(255,45,45,0.85)]"
              >
                <span>Register Now (₹70)</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
