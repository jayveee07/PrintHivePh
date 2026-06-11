import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import logor from '../assets/logor.png';

const facebookUrl = 'https://web.facebook.com/profile.php?id=61589664537961';

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Branding */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded flex items-center justify-center overflow-hidden">
              <img src={logor} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-white">PrintHive PH</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Revolutionizing the printing industry with futuristic tech and creative passion. Your vision, expertly printed.
          </p>
          <div className="flex gap-4">
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#12A8FF] hover:text-white transition-all"
            >
              <Facebook size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#FF1493] hover:text-white transition-all">
              <Instagram size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#A020F0] hover:text-white transition-all">
              <Twitter size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-bold mb-6">Quick Links</h3>
          <ul className="space-y-4">
            {['Home', 'Services', 'Supplies', 'Portfolio', 'About'].map((item) => (
              <li key={item}>
                <Link to={`/${item === 'Home' ? '' : item.toLowerCase()}`} className="text-gray-400 hover:text-[#12A8FF] text-sm transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-white font-bold mb-6">Services</h3>
          <ul className="space-y-4">
            {['T-Shirt Printing', 'Tarpaulin', 'Stickers & Labels', 'Business Cards', 'Custom Merchandise'].map((item) => (
              <li key={item} className="text-gray-400 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white font-bold mb-6">Contact Us</h3>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-gray-400 text-sm">
              <Phone size={16} className="text-[#12A8FF]" />
              +(63) 970 763 9960
            </li>
            <li className="flex items-center gap-3 text-gray-400 text-sm">
              <Mail size={16} className="text-[#FF1493]" />
              printhiveph.2026@gmail.com
            </li>
            <li className="flex items-center gap-3 text-gray-400 text-sm">
              <MapPin size={16} className="text-[#A020F0]" />
              San Jose de Buenavista, Antique Philippines 5700
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center">
        <p className="text-gray-500 text-xs text-balance">
          &copy; {new Date().getFullYear()} PrintHive PH. Creative Prints Made Easy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
