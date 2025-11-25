import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Bell,
  BarChart3,
  Share,
  PlusSquare,
  MoreVertical,
  Smartphone,
  Zap,
  DownloadCloud,
} from "lucide-react";
import type { ElementType, ReactNode } from "react";
import Logo from "./Logo";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Navigation - Sticky Wrapper */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 transition-all">
        <nav className="px-6 py-4 flex justify-between items-center max-w-5xl mx-auto">
          <Logo />
          <button
            onClick={() => navigate("/app")}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-full transition-colors border border-slate-700"
          >
            Launch App
          </button>
        </nav>
      </div>

      {/* Hero Section */}
      <header className="px-6 pt-12 pb-16 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          Now available as a PWA
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
          Don't let your <span className="text-blue-600">subscriptions</span>{" "}
          control you.
        </h1>
        <p className="text-slate-400 text-lg md:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
          Track every penny, get notified before payments, and visualize your
          monthly spend. SubMinder is the privacy-focused tracker that lives on
          your phone.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate("/app")}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all hover:scale-105"
          >
            Launch App
          </button>
          <a
            href="#install"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium rounded-xl border border-slate-800 transition-colors"
          >
            How to Install
          </a>
        </div>
      </header>

      {/* Core Features Grid */}
      <section className="px-4 py-16 border-y border-slate-800/50 bg-slate-900/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-2">
              Everything you need
            </h2>
            <p className="text-slate-400 text-sm">
              Simple, powerful, and respectful of your data.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Bell}
              title="Smart Notifications"
              desc="Never miss a bill. Get alerts 1, 3, or 7 days before a payment is due."
            />
            <FeatureCard
              icon={BarChart3}
              title="Spend Insights"
              desc="See exactly where your money goes with beautiful interactive charts."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Privacy First"
              desc="No bank connections required. You manually add only what you want to track."
            />
          </div>
        </div>
      </section>

      {/* PWA Benefits Section */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why no App Store?
            </h2>
            <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto">
              SubMinder is a <strong>Progressive Web App (PWA)</strong>. This
              means you get the same premium app experience without the
              downsides of traditional store apps.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400">
                <DownloadCloud size={24} />
              </div>
              <h3 className="font-semibold text-white mb-2">No Download</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Installs instantly. No waiting for 100MB downloads.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <Zap size={24} />
              </div>
              <h3 className="font-semibold text-white mb-2">Save Storage</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uses a fraction of the space compared to native apps.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-400">
                <Smartphone size={24} />
              </div>
              <h3 className="font-semibold text-white mb-2">Always Updated</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You always have the latest version. No manual updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Instructions */}
      <section
        id="install"
        className="px-6 py-20 max-w-4xl mx-auto border-t border-slate-800/50"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Install on your Device
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Follow these simple steps to add SubMinder to your home screen for
            the full full-screen app experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* iOS Instructions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 grayscale group-hover:grayscale-0 transition-all">
              <Share size={120} />
            </div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-blue-500"></span> iOS (Safari)
            </h3>
            <ol className="space-y-5 text-slate-300 text-sm relative z-10">
              <InstallStep number={1}>
                Tap <strong>Launch App</strong> above to open the app view.
              </InstallStep>
              <InstallStep number={2}>
                Tap the <strong>Share</strong> icon{" "}
                <Share className="inline w-3 h-3 mx-1" /> in the menu bar.
              </InstallStep>
              <InstallStep number={3}>
                Scroll down and tap <strong>Add to Home Screen</strong>.
              </InstallStep>
              <InstallStep number={4}>
                Tap <strong>Add</strong> to finish.
              </InstallStep>
            </ol>
          </div>

          {/* Android Instructions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 grayscale group-hover:grayscale-0 transition-all">
              <PlusSquare size={120} />
            </div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-green-500">🤖</span> Android (Chrome)
            </h3>
            <ol className="space-y-5 text-slate-300 text-sm relative z-10">
              <InstallStep number={1}>
                Tap <strong>Launch App</strong> above to open the app view.
              </InstallStep>
              <InstallStep number={2}>
                Tap the <strong>Three Dots</strong>{" "}
                <MoreVertical className="inline w-3 h-3 mx-1" /> menu in the top
                right.
              </InstallStep>
              <InstallStep number={3}>
                Tap <strong>Install App</strong> or{" "}
                <strong>Add to Home Screen</strong>.
              </InstallStep>
              <InstallStep number={4}>
                Follow the prompt to install.
              </InstallStep>
            </ol>
          </div>
        </div>
      </section>

      <footer className="py-12 text-center text-slate-600 text-sm border-t border-slate-900">
        <p>© {new Date().getFullYear()} SubMinder. All rights reserved.</p>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: ElementType;
  title: string;
  desc: string;
}

function FeatureCard({ icon: Icon, title, desc }: FeatureCardProps) {
  return (
    <div className="p-6 bg-slate-950 rounded-xl border border-slate-800/50 hover:border-blue-600/30 transition-colors h-full">
      <div className="w-12 h-12 bg-blue-900/20 rounded-lg flex items-center justify-center mb-4 text-blue-500">
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function InstallStep({
  number,
  children,
}: {
  number: number;
  children: ReactNode;
}) {
  return (
    <li className="flex gap-3 items-start">
      <span className="bg-slate-800 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 mt-0.5 border border-slate-700">
        {number}
      </span>
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}
