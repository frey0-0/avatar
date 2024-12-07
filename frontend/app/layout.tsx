import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { cookieToInitialState } from "wagmi";
import { getConfig } from "./wagmi";
import { headers } from "next/headers";
import Navbar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });
const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

// const wagmiConfig = createConfig({
//   chains: [baseSepolia],
//   connectors: [
//     coinbaseWallet ({
//       appName: process.env.NEXT_PUBLIC_ONCHAINKIT_APP_NAME ?? "OnchainKit",
//     }),
//   ],
//   ssr: true,
//   transports: {
//     [baseSepolia.id]: http(),
//   },
// });

export const metadata: Metadata = {
  title: "EthIndia",
  description: "Your replica on Blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(
    getConfig(),
    headers().get("cookie")
  );
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen`}>
        <Providers >
          <Navbar />
          <main className="pt-16"> {/* Add padding-top to account for fixed navbar */}
            {children}
            <div className="absolute w-[300vw] h-[250vw] bg-gradient-radial from-blue-600/10 to-transparent -bottom-1/2 -right-1/2 blur-3xl animate-pulse-slow" />
          </main>
        </Providers>
      </body>
    </html>
  );
}
