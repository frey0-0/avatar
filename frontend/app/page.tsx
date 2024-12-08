"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "./components/Navbar";
import { useRef, useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import BackgroundAnimation from "./components/Background";
import { useRouter } from "next/navigation";

interface Token {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
}

const mockChartData = [
  { time: "00:00", price: 100 },
  { time: "04:00", price: 120 },
  { time: "08:00", price: 110 },
  { time: "12:00", price: 130 },
  { time: "16:00", price: 140 },
  { time: "20:00", price: 135 },
];

export default function Dex() {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const handleTokenClick = (token: Token) => {
    setSelectedToken(token);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedToken(null);
  };

  const handleBuy = () => {
    console.log(`Buying ${selectedToken?.symbol}`);
  };

  const handleSell = () => {
    console.log(`Selling ${selectedToken?.symbol}`);
  };
  useEffect(() => {
    const answers = localStorage.getItem("answers");

    if (answers) {
      router.push("/dex");
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 relative overflow-hidden">
      <BackgroundAnimation />
      <div className="absolute inset-0">
        <div className="absolute w-[300vw] h-[300vw] bg-gradient-radial from-blue-400/10 to-transparent -top-1/2 -left-1/2 blur-3xl animate-pulse-slow" />
        <div className="absolute w-[200vw] h-[200vw] bg-gradient-radial from-blue-600/10 to-transparent -bottom-1/2 -right-1/2 blur-3xl animate-pulse-slow" />
      </div>

      <section className="min-h-screen pt-16 relative flex items-center justify-center">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="grid md:grid-cols-2 gap-12 items-center w-full">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.h1
                  className="text-6xl md:text-7xl lg:text-8xl font-extrabold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Anonymous Survey Platform
                </motion.h1>
                <motion.p
                  className="text-xl md:text-2xl text-blue-100/90 max-w-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Share your thoughts securely and privately using our advanced
                  anonymous verification system.
                </motion.p>
              </div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  href="/questionnaire"
                  className="px-8 py-4 bg-gradient-to-br from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-110 shadow-xl shadow-blue-700/30 text-center"
                >
                  Get Started
                </Link>
                <a
                  href="#about"
                  className="px-8 py-4 backdrop-blur-sm bg-blue-950/30 hover:bg-blue-900/40 text-white rounded-xl font-medium border border-blue-400/20 transition-all duration-300 transform hover:scale-105 text-center"
                >
                  Learn More
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="aspect-square relative">
                {/* Rotating SVG */}
                <motion.svg
                  viewBox="0 0 200 200"
                  className="w-full h-full"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" style={{ stopColor: "#2563EB" }} />
                      <stop offset="100%" style={{ stopColor: "#60A5FA" }} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M100,20 C120,20 140,40 140,60 C140,80 120,100 100,100 C80,100 60,80 60,60 C60,40 80,20 100,20"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="40"
                    fill="url(#gradient)"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      values="40;45;40"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  {/* Animated dots at vertices */}
                  <circle r="4" cx="0" cy="-80" fill="#60A5FA">
                    <animate
                      attributeName="opacity"
                      values="0.3;1;0.3"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle r="4" cx="69.28" cy="-40" fill="#60A5FA">
                    <animate
                      attributeName="opacity"
                      values="0.3;1;0.3"
                      dur="2s"
                      repeatCount="indefinite"
                      begin="0.33s"
                    />
                  </circle>
                  <circle r="4" cx="69.28" cy="40" fill="#60A5FA">
                    <animate
                      attributeName="opacity"
                      values="0.3;1;0.3"
                      dur="2s"
                      repeatCount="indefinite"
                      begin="0.66s"
                    />
                  </circle>
                  <circle r="4" cx="0" cy="80" fill="#60A5FA">
                    <animate
                      attributeName="opacity"
                      values="0.3;1;0.3"
                      dur="2s"
                      repeatCount="indefinite"
                      begin="1s"
                    />
                  </circle>
                  <circle r="4" cx="-69.28" cy="40" fill="#60A5FA">
                    <animate
                      attributeName="opacity"
                      values="0.3;1;0.3"
                      dur="2s"
                      repeatCount="indefinite"
                      begin="1.33s"
                    />
                  </circle>
                  <circle r="4" cx="-69.28" cy="-40" fill="#60A5FA">
                    <animate
                      attributeName="opacity"
                      values="0.3;1;0.3"
                      dur="2s"
                      repeatCount="indefinite"
                      begin="1.66s"
                    />
                  </circle>
                </motion.svg>

                {/* Floating Elements */}
                <motion.div
                  className="absolute top-1/4 left-1/4 w-16 h-16 bg-blue-500/20 rounded-full backdrop-blur-xl shadow-xl shadow-blue-500/30"
                  animate={{
                    y: [0, -20, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-600/20 rounded-full backdrop-blur-xl shadow-xl shadow-blue-600/30"
                  animate={{
                    y: [0, 20, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* <section className="min-h-screen pt-16 relative flex items-center justify-center">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="grid md:grid-cols-2 gap-12 items-center w-full">
            <Typography variant="h4" component="h1" gutterBottom>
              Token List
            </Typography>

            <Paper elevation={3} className="w-full max-w-2xl">
              <List>
                {mockTokens.map((token) => (
                  <ListItem
                    key={token.id}
                    onClick={() => handleTokenClick(token)}
                    className="cursor-pointer hover:bg-gray-100"
                    divider
                  >
                    <ListItemText
                      primary={`${token.name} (${token.symbol})`}
                      secondary={`$${token.price.toLocaleString()} | ${token.change24h}%`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </div>
        </div>
      </section> */}

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="token-modal"
      >
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-3xl">
          <Typography variant="h5" component="h2" gutterBottom>
            {selectedToken?.name} ({selectedToken?.symbol})
          </Typography>

          <div className="my-6">
            <LineChart width={600} height={300} data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#8884d8"
                name="Price"
              />
            </LineChart>
          </div>

          <div className="flex gap-4 justify-center mt-4">
            <Button
              variant="contained"
              color="success"
              onClick={handleBuy}
              className="w-32"
            >
              Buy
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleSell}
              className="w-32"
            >
              Sell
            </Button>
          </div>
        </Box>
      </Modal>
    </main>
  );
}
