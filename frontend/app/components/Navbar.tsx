"use client";

import { WalletDefault } from "@coinbase/onchainkit/wallet";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import "@coinbase/onchainkit/styles.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/50 backdrop-blur-lg shadow-lg" : "bg-transparent"
      }`}
      style={{ height: "90px", padding: "0 30px", fontSize: "20px" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-20 px-8 lg:px-10">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-4 group">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
              <span className="text-3xl font-bold text-white">Shunya</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent hidden sm:block">
              Survey App
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <NavLink href="/questionnaire">Take Survey</NavLink>
            <NavLink href="#about">About</NavLink>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-6 px-8 py-3 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-shadow duration-300"
            >
              Get Started
            </motion.button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-3 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-6 relative flex flex-col justify-between">
              <span
                className={`w-full h-0.5 bg-white transform transition-all duration-300 ${
                  isOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`w-full h-0.5 bg-white transition-all duration-300 ${
                  isOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`w-full h-0.5 bg-white transform transition-all duration-300 ${
                  isOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10"
            >
              <div className="flex flex-col px-8 py-6 space-y-6 bg-blue-950/50 backdrop-blur-lg">
                <Link
                  href="/questionnaire"
                  className="text-blue-100/90 hover:text-white font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Take Survey
                </Link>
                <Link
                  href="#about"
                  className="text-blue-100/90 hover:text-white font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-8 py-3 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-shadow duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Connect
                  {/* <WalletDefault /> */}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="relative px-6 py-3.5 text-lg font-medium text-white/90 hover:text-white transition-colors duration-200 group"
    >
      {children}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
        initial={false}
      />
    </Link>
  );
}
