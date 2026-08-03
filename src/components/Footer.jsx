import React from 'react';
import { Film, ShieldCheck, Heart, Globe, ExternalLink } from 'lucide-react';

export function Footer({ setCurrentView }) {
  return (
    <footer className="mt-20 border-t border-white/10 bg-black/90 backdrop-blur-xl py-12 px-4 sm:px-6 lg:px-8 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <Film className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-white tracking-wider">
              AIR<span className="text-red-600">FLIX</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            The next-generation cinema streaming experience powered by high performance Ultra HD stream servers.
          </p>
          <div className="flex items-center gap-2 text-xs text-green-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-green-500" /> Ultra HD Optimized
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-white">Explore</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => setCurrentView('home')}
                className="hover:text-red-500 transition-colors"
              >
                Featured Spotlight
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentView('movies')}
                className="hover:text-red-500 transition-colors"
              >
                Popular Movies
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentView('tv')}
                className="hover:text-red-500 transition-colors"
              >
                TV Series & Shows
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentView('trending')}
                className="hover:text-red-500 transition-colors"
              >
                Top Trending Now
              </button>
            </li>
          </ul>
        </div>

        {/* Streaming Tech */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-white">Streaming Engine</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-1.5 text-gray-300">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" /> AirFlix Ultra HD Engine
            </li>
            <li className="flex items-center gap-1.5 text-gray-300">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" /> Auto-Adaptive Quality Switcher
            </li>
            <li className="flex items-center gap-1.5 text-gray-300">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" /> Multi-Resolution Stream Proxy
            </li>
            <li className="flex items-center gap-1.5 text-gray-300">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" /> 4K Cinema Playback
            </li>
          </ul>
        </div>

        {/* Legal Disclaimer */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-white">Legal Disclaimer</h4>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            AirFlix does not host or store any media content on its servers. All media metadata is curated for high quality presentation. Video streams are served via third-party iframe embed APIs.
          </p>
        </div>
      </div>

      {/* Bottom Sub-Footer Bar */}
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <p className="text-gray-500">
          © {new Date().getFullYear()} AirFlix Cinema. All rights reserved.
        </p>
        <div className="flex items-center gap-1.5 text-gray-400 font-medium">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-red-600 fill-current animate-pulse" />
          <span>by</span>
          <a
            href="https://drkvenom786.github.io/webpage/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-extrabold hover:text-red-500 transition-colors tracking-wider uppercase bg-red-600/10 border border-red-600/30 px-2 py-0.5 rounded-md hover:bg-red-600/20"
          >
            VENOM
          </a>
        </div>
      </div>
    </footer>
  );
}
