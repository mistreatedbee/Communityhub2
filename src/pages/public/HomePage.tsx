import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Shield, Users, Sparkles, KeyRound, 
  MessageCircle, CheckCircle, Globe, Zap, 
  Layers, Layout, Calendar, Share2 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

export function HomePage() {
  const { organization } = useTheme();
  const { user, resolveDashboardTarget } = useAuth();
  const navigate = useNavigate();
  const [dashboardTarget, setDashboardTarget] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      resolveDashboardTarget().then(setDashboardTarget);
    }
  }, [user, resolveDashboardTarget]);

  return (
    <div className="relative min-h-screen bg-white text-slate-900 selection:bg-[var(--color-primary)] selection:text-white overflow-x-hidden">
      
      {/* --- PRE-HERO: AMBIENT ELEMENTS --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] -z-10 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] rounded-full bg-[var(--color-primary)]/20 blur-[120px] animate-pulse" />
        <div className="absolute top-[10%] right-[-5%] w-[30%] h-[50%] rounded-full bg-blue-200/30 blur-[100px]" />
      </div>

      {/* --- 1. HERO SECTION: BOLD & UNIGNORABLE --- */}
      <section className="relative pt-24 pb-20 md:pt-40 md:pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-primary)]"></span>
            </span>
            The Future of Community Management
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 animate-fade-in-up">
            YOUR COMMUNITY.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-blue-600">
              YOUR RULES.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-2xl text-slate-600 mb-10 leading-relaxed animate-fade-in-up delay-100">
            Stop losing your members in messy group chats. Build a professional, branded hub 
            where events happen, content lives, and growth is inevitable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200">
            <Button 
              size="lg" 
              className="w-full sm:w-auto px-10 py-8 text-xl rounded-2xl shadow-2xl shadow-[var(--color-primary)]/20 hover:scale-105 transition-all"
              onClick={() => navigate('/enter-license')}
            >
              Create Your Hub
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
            
            {user && dashboardTarget ? (
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-10 py-8 text-xl rounded-2xl" onClick={() => navigate(dashboardTarget)}>
                Access Dashboard
              </Button>
            ) : (
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-10 py-8 text-xl rounded-2xl" onClick={() => navigate('/login')}>
                Admin Login
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* --- 2. PROBLEM/SOLUTION: THE DISRUPTION --- */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                Group chats are where communities go to die.
              </h2>
              <div className="space-y-6">
                {[
                  { title: "No Structure", desc: "Important announcements get buried in seconds." },
                  { title: "No Ownership", desc: "You are a guest on someone else's platform." },
                  { title: "No Branding", desc: "Your organization looks like a casual hobby." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">✕</div>
                    <div>
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
               <div className="inline-flex p-3 rounded-2xl bg-green-50 text-green-600 mb-4">
                 <Shield className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-bold mb-4">The Community Hub Advantage</h3>
               <p className="text-slate-600 mb-6">One centralized home for everything. Your members don't just chat; they engage with a structured organization designed for scale.</p>
               <ul className="space-y-3">
                 {['Private Member Directory', 'Structured Resource Library', 'Event Management', 'Unified Announcements'].map((check) => (
                   <li key={check} className="flex items-center gap-2 font-medium">
                     <CheckCircle className="w-5 h-5 text-green-500" /> {check}
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. CAPABILITIES: NOT FEATURES --- */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6">Built for Serious Organizations.</h2>
            <p className="text-xl text-slate-500 max-w-xl">Capabilities that transform how you lead.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <CapabilityBlock 
              icon={<Layout className="w-10 h-10" />}
              title="Branded Headquarters"
              desc="Not a group. A website. Every community gets a custom-branded home that looks and feels premium."
            />
            <CapabilityBlock 
              icon={<Zap className="w-10 h-10" />}
              title="Impactful Broadcasts"
              desc="Announcements that actually reach people. No noise, just clarity."
            />
            <CapabilityBlock 
              icon={<Calendar className="w-10 h-10" />}
              title="Centralized Events"
              desc="From small meetups to major conferences. Manage registrations and schedules in one place."
            />
            <CapabilityBlock 
              icon={<Layers className="w-10 h-10" />}
              title="Knowledge Hubs"
              desc="Keep your documents, PDFs, and training videos organized and accessible."
            />
            <CapabilityBlock 
              icon={<Users className="w-10 h-10" />}
              title="Member Intelligence"
              desc="Profiles with depth. Know who is in your community beyond a phone number."
            />
            <CapabilityBlock 
              icon={<Share2 className="w-10 h-10" />}
              title="Sub-Group Logic"
              desc="Segment your community into teams, departments, or regions with specific permissions."
            />
          </div>
        </div>
      </section>

      {/* --- 4. PREVIEW: REAL SaaS VIBE --- */}
      <section className="py-24 bg-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Experience the Platform</h2>
            <p className="text-slate-400">Everything organized. Perfectly structured.</p>
          </div>
          
          {/* Mockup Container */}
          <div className="relative mx-auto max-w-5xl rounded-t-2xl border-x border-t border-slate-700 bg-slate-800 p-4 shadow-2xl">
            <div className="flex gap-2 mb-4 border-b border-slate-700 pb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="grid grid-cols-12 gap-4 h-[400px]">
              <div className="col-span-3 space-y-3">
                 <div className="h-8 w-full bg-slate-700 rounded animate-pulse" />
                 <div className="h-32 w-full bg-slate-700/50 rounded" />
                 <div className="h-32 w-full bg-slate-700/50 rounded" />
              </div>
              <div className="col-span-9 bg-slate-700/30 rounded-lg p-6">
                 <div className="h-4 w-1/3 bg-slate-600 rounded mb-6" />
                 <div className="space-y-4">
                   <div className="h-20 w-full bg-slate-600/40 rounded-xl" />
                   <div className="h-20 w-full bg-slate-600/40 rounded-xl" />
                   <div className="h-20 w-full bg-slate-600/40 rounded-xl" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 5. POSITIONING: WHO IT'S FOR --- */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center">Built for Scale. Built for You.</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {['Churches', 'NGOs', 'Education', 'Training', 'Movements'].map((target) => (
              <div key={target} className="p-8 border border-slate-100 rounded-3xl text-center hover:bg-slate-50 transition-colors">
                <p className="font-black text-xl">{target}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 6. TRUST & SECURITY --- */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
          <div className="p-6 rounded-3xl bg-white shadow-sm border border-slate-200">
            <Shield className="w-16 h-16 text-[var(--color-primary)] mb-4 mx-auto md:mx-0" />
            <h3 className="text-2xl font-bold mb-2">Enterprise-Grade Security</h3>
            <p className="text-slate-500">Your data is isolated, encrypted, and owned by you. We follow strict multi-tenant security protocols.</p>
          </div>
          <div className="p-6 rounded-3xl bg-white shadow-sm border border-slate-200">
            <Globe className="w-16 h-16 text-[var(--color-primary)] mb-4 mx-auto md:mx-0" />
            <h3 className="text-2xl font-bold mb-2">Global Infrastructure</h3>
            <p className="text-slate-500">Fast, reliable, and available everywhere. Built on a stack that handles millions of members.</p>
          </div>
        </div>
      </section>

      {/* --- 7. FINAL CTA --- */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-[var(--color-primary)] p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <h2 className="text-4xl md:text-7xl font-black mb-8 leading-tight">Ready to build the right way?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[var(--color-primary)] hover:bg-slate-100 text-xl px-10 py-8 rounded-2xl" onClick={() => navigate('/enter-license')}>
              Start My Hub
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-xl px-10 py-8 rounded-2xl" onClick={() => window.open('https://wa.me/27731531188')}>
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-slate-100 text-center text-slate-400 text-sm">
        <p>© 2026 {organization.name}. All rights reserved.</p>
      </footer>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
}

function CapabilityBlock({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group space-y-6 p-2">
      <div className="text-[var(--color-primary)] transition-transform duration-300 group-hover:-translate-y-2">
        {icon}
      </div>
      <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
      <p className="text-slate-500 text-lg leading-relaxed">{desc}</p>
    </div>
  );
}
