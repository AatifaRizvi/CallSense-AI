import logo from '../logo.png';
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  BarChart2,
  Globe,
  ArrowRight,
  Star,
  Mic,
  History,
  Download,
  Users,
  Upload,
  Sparkles,
  Mail,
} from "lucide-react";
import AnimatedBackground from '../components/AnimatedBackground';

const whyFeatures = [
  { icon: Mic,       title: "AI Call Analysis",        desc: "Analyze sales calls in seconds, not hours.", color: "text-indigo-400", bg: "bg-indigo-500/10", ring: "group-hover:shadow-indigo-500/20" },
  { icon: Globe,     title: "Multilingual Support",    desc: "Native support for English, Hindi & Hinglish.", color: "text-blue-400", bg: "bg-blue-500/10", ring: "group-hover:shadow-blue-500/20" },
  { icon: BarChart2, title: "Analytics Dashboard",     desc: "Visual insights and performance metrics at a glance.", color: "text-green-400", bg: "bg-green-500/10", ring: "group-hover:shadow-green-500/20" },
  { icon: History,   title: "Analysis History",        desc: "Access every past analysis anytime you need it.", color: "text-purple-400", bg: "bg-purple-500/10", ring: "group-hover:shadow-purple-500/20" },
  { icon: Download,  title: "CSV Export",              desc: "Export results with a single click.", color: "text-cyan-400", bg: "bg-cyan-500/10", ring: "group-hover:shadow-cyan-500/20" },
  { icon: Star,      title: "Review Analysis",         desc: "Analyze reviews right alongside sales calls.", color: "text-yellow-400", bg: "bg-yellow-500/10", ring: "group-hover:shadow-yellow-500/20" },
  { icon: Users,     title: "User Management",         desc: "Admin dashboard for managing your whole team.", color: "text-pink-400", bg: "bg-pink-500/10", ring: "group-hover:shadow-pink-500/20" },
  { icon: Zap,       title: "Instant Results",         desc: "Upload, Analyze, Download. That simple.", color: "text-orange-400", bg: "bg-orange-500/10", ring: "group-hover:shadow-orange-500/20" },
];

const howItWorks = [
  {
    icon: Upload,
    title: "Upload or Paste",
    desc: "Upload a call recording, a CSV of reviews, or just paste text directly — whichever's easiest.",
  },
  {
    icon: Sparkles,
    title: "AI Analyzes It",
    desc: "CallSense AI reads the content and extracts sentiment, objections, category, and action items.",
  },
  {
    icon: BarChart2,
    title: "See Your Dashboard",
    desc: "Every user gets their own dashboard — your calls, your reviews, your insights, updated instantly.",
  },
];

const stats = [
  { value: "2,800+", label: "Conversations Analyzed" },
  { value: "3",      label: "Languages Supported" },
  { value: "<10s",    label: "Response Time" },
  { value: "50",    label: "Rows per CSV Upload" },
];

const languageExamples = {
  english: {
    label: "English",
    raw: `"I understand the renewal pricing seems a bit high for your team. But if you commit to an annual plan, we can offer a 20% discount — plus round-the-clock support, which you're not currently getting."`,
    tags: [
      { text: "Neutral", color: "text-yellow-400 bg-yellow-400/10" },
      { text: "Pricing Objection", color: "text-indigo-400 bg-indigo-400/10" },
      { text: "English", color: "text-blue-400 bg-blue-400/10" },
    ],
    objection: "Renewal pricing seen as high by customer",
    action: "Follow up with annual-plan discount offer",
  },
  hindi: {
    label: "Hindi",
    raw: `"Sir, main samajhta hoon ki renewal ki keemat thodi zyada lag rahi hai. Lekin agar aap varshik plan lete hain to hum 20% chhoot de sakte hain, saath hi 24/7 support bhi milega."`,
    tags: [
      { text: "Neutral", color: "text-yellow-400 bg-yellow-400/10" },
      { text: "Pricing Objection", color: "text-indigo-400 bg-indigo-400/10" },
      { text: "Hindi", color: "text-orange-400 bg-orange-400/10" },
    ],
    objection: "Renewal pricing seen as high by customer",
    action: "Follow up with annual-plan discount offer",
  },
  hinglish: {
    label: "Hinglish",
    raw: `"Sir dekhiye, aapka current plan mein renewal charges thoda zyada lag rahe hain, main samajh sakta hoon. Lekin agar aap annual commitment karte hain toh hum 20% discount de sakte hain. Aur support bhi 24/7 milega."`,
    tags: [
      { text: "Neutral", color: "text-yellow-400 bg-yellow-400/10" },
      { text: "Pricing Objection", color: "text-indigo-400 bg-indigo-400/10" },
      { text: "Hinglish", color: "text-green-400 bg-green-400/10" },
    ],
    objection: "Renewal pricing seen as high by customer",
    action: "Follow up with annual-plan discount offer",
  },
};

function LinkedinIcon({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.558V9h3.556v11.452z"/>
    </svg>
  );
}

function GithubIcon({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.469-2.38 1.236-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.804 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.604-.014 2.896-.014 3.286 0 .32.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  );
}

function YoutubeIcon({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function FadeIn({ children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {children}
    </div>
  );
}

function Landing() {
  const navigate = useNavigate();
  const [activeLang, setActiveLang] = useState("hinglish");
  const example = languageExamples[activeLang];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden">
      <AnimatedBackground dark={true} />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10">
        <div className="w-full px-6 sm:px-10 lg:px-16 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="CallSense AI" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-white font-semibold text-lg tracking-tight">
              CallSense <span className="text-indigo-400">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="text-white/60 hover:text-white text-sm font-medium transition-all px-3 py-2"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/login")}
              className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* 1. Hero */}
      <section className="px-6 sm:px-10 lg:px-16 py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-indigo-400 text-xs font-medium mb-6">
          <Zap size={12} />
          AI-Powered Sales Intelligence
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
          Turn Every Sales Call Into
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {" "}Actionable Insights
          </span>
        </h1>

        <p className="text-white/50 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
          CallSense AI analyzes your sales calls and customer reviews using
          advanced AI — detecting sentiment, objections, and outcomes
          automatically, with native support for English, Hindi, and Hinglish.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            Start Analyzing <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            View Dashboard
          </button>
        </div>
      </section>

      {/* 2. Product Preview */}
      <FadeIn>
        <section className="px-6 sm:px-10 lg:px-16 pb-24 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-white/5 shadow-2xl overflow-hidden hover:border-white/20 transition-all">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="text-white/30 text-xs bg-black/20 rounded-md px-3 py-1">
                  app.callsense.ai/dashboard
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-2 flex flex-col items-center justify-center">
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center transition-transform hover:scale-105"
                  style={{ background: "conic-gradient(#22c55e 0% 58%, #f59e0b 58% 78%, #ef4444 78% 100%)" }}
                >
                  <div className="w-20 h-20 rounded-full bg-[#0f172a] flex flex-col items-center justify-center">
                    <span className="text-white text-lg font-bold">58%</span>
                    <span className="text-white/40 text-[10px]">Positive</span>
                  </div>
                </div>
                <p className="text-white/40 text-xs mt-3">Sentiment Distribution</p>
              </div>

              <div className="md:col-span-3 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total Analyzed", value: "2,800+" },
                    { label: "Analysis Fields (Title, Sentiment, Category, Intent, Summary, Objection, Action Item, Outcome, Risk Level, and Language.)", value: "10" },
                    { label: "Avg. Response", value: "<10s" },
                    
                  ].map((s) => (
                    <div key={s.label} className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all">
                      <p className="text-white text-lg font-bold">{s.value}</p>
                      <p className="text-white/30 text-[10px] mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {[
                    { label: "Pricing objection follow-up",    tag: "Neutral",  color: "text-yellow-400 bg-yellow-400/10" },
                    { label: "Demo scheduled — enterprise lead", tag: "Positive", color: "text-green-400 bg-green-400/10" },
                    { label: "Support delay complaint",         tag: "Negative", color: "text-red-400 bg-red-400/10" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2 hover:bg-white/10 transition-all">
                      <span className="text-white/60 text-xs truncate">{row.label}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${row.color} flex-shrink-0 ml-2`}>
                        {row.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* 3. Stats */}
      <section className="px-6 sm:px-10 lg:px-16 py-12 border-y border-white/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {value}
              </p>
              <p className="text-white/40 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. About */}
      <FadeIn>
        <section className="px-6 sm:px-10 lg:px-16 py-24 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">What Is CallSense AI</h2>
          <p className="text-white/50 text-lg leading-relaxed">
            CallSense AI was built because most sales intelligence tools stop
            understanding a conversation the moment it stops being pure English.
            Real sales calls and customer reviews mix languages, slang, and tone
            — so CallSense AI was designed from the ground up to read them as
            they actually happen, and turn every call or review into sentiment,
            objections, and clear next steps, automatically.
          </p>
        </section>
      </FadeIn>

      {/* 5. How It Works */}
      <FadeIn>
        <section className="px-6 sm:px-10 lg:px-16 py-24 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-white/40 text-lg">No setup, no integrations — just three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorks.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="relative bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/8 hover:border-white/20 hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                    <Icon size={18} className="text-indigo-400" />
                  </div>
                  <span className="text-white/20 text-2xl font-bold">0{i + 1}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* 6. Multilingual Demo */}
      <FadeIn>
        <section className="px-6 sm:px-10 lg:px-16 py-24 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-indigo-400 text-xs font-medium mb-6">
              <Globe size={12} />
              See It In Action
            </div>
            <h2 className="text-3xl font-bold mb-4">One Model. Three Languages.</h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              Most sales intelligence tools are built for English-only conversations.
              CallSense AI reads the same call whether it is in English, Hindi, or Hinglish.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            {Object.entries(languageExamples).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setActiveLang(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeLang === key
                    ? "bg-indigo-500 text-white"
                    : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                {val.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
              <p className="text-white/40 text-xs font-medium uppercase tracking-wide mb-3">Raw Call Transcript</p>
              <p className="text-white/70 text-sm leading-relaxed">{example.raw}</p>
            </div>

            <div className="bg-white/5 border border-indigo-500/20 rounded-xl p-6 space-y-3 hover:border-indigo-500/40 transition-all">
              <p className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1">CallSense AI Output</p>
              <div className="flex flex-wrap gap-2">
                {example.tags.map((tag) => (
                  <span key={tag.text} className={`px-2.5 py-1 rounded-full text-xs font-medium ${tag.color}`}>
                    {tag.text}
                  </span>
                ))}
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1">Objection</p>
                <p className="text-white/80 text-sm">{example.objection}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1">Action Item</p>
                <p className="text-indigo-300 text-sm">{example.action}</p>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* 7. Why Choose */}
      <FadeIn>
        <section className="px-6 sm:px-10 lg:px-16 py-24 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">Why Choose CallSense AI</h2>
            <p className="text-white/40 text-lg">Everything a sales team needs, in one place</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyFeatures.map(({ icon: Icon, title, desc, color, bg, ring }) => (
              <div key={title} className={`group relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-1 hover:shadow-xl ${ring} transition-all duration-300`}>
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={20} className={color} />
                </div>
                <h3 className="text-white font-semibold text-[15px] mb-2">{title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* 8. CTA */}
      <FadeIn>
        <section className="px-6 sm:px-10 lg:px-16 py-24 text-center">
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-white/40 mb-8">
              Join sales teams already using CallSense AI to close more deals.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium transition-all mx-auto"
            >
              Get Started Free <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </FadeIn>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 sm:px-10 lg:px-16 py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src={logo} alt="CallSense AI" className="w-6 h-6 rounded-lg object-cover" />
          <span className="text-white/60 text-sm font-medium">CallSense AI</span>
        </div>

        <p className="text-white/20 text-xs mb-5">
          Built with React, FastAPI, Supabase & Groq
        </p>

        {/* Social links */}
        <div className="flex items-center justify-center gap-4 mb-5">
          <a
            href="https://linkedin.com/in/aatifa-rizvi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-indigo-400 transition-colors"
            aria-label="LinkedIn"
          >
            <LinkedinIcon size={16} />
          </a>
          <a
            href="https://github.com/AatifaRizvi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-indigo-400 transition-colors"
            aria-label="GitHub"
          >
            <GithubIcon size={16} />
          </a>
          <a
            href="https://youtube.com/@YOUR_CHANNEL"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-red-400 transition-colors"
            aria-label="YouTube Demo"
          >
            <YoutubeIcon size={16} />
          </a>
          <a
            href="mailto:rizviaatifa235@gmail.com"
            className="text-white/40 hover:text-indigo-400 transition-colors"
            aria-label="Email"
          >
            <Mail size={16} />
          </a>
        </div>

        <p className="text-white/30 text-xs">
          Designed & built by{" "}
          <a
            href="https://github.com/AatifaRizvi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-indigo-400 transition-colors font-medium"
          >
            Aatifa Rizvi
          </a>
        </p>

        <p className="text-white/15 text-xs mt-3">
          {new Date().getFullYear()} CallSense AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Landing;
