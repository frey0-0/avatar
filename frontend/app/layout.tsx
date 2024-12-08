import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cookieToInitialState, WagmiProvider } from "wagmi";
import { config } from "./config";
import { headers } from "next/headers";
import Navbar from "./components/Navbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Web3Provider } from "./components/providers";

// import { WagmiProvider, createConfig, http } from 'wagmi';
// import { baseSepolia } from 'wagmi/chains';
const queryClient = new QueryClient();

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EthIndia",
  description: "Your replica on Blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-gray-900 text-white min-h-screen`}
      >
        <Web3Provider>
          <Navbar />
          <main className="pt-16">
            {children}
            <div className="absolute w-[300vw] h-[250vw] bg-gradient-radial from-blue-600/10 to-transparent -bottom-1/2 -right-1/2 blur-3xl animate-pulse-slow" />
          </main>
        </Web3Provider>
      </body>
    </html>
  );
}
