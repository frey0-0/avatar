"use client";

import { useDebugValue, useEffect, useState } from "react";
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

import ETHChart, { ChartData } from "../components/Ethchart";
import axios from "axios";
import { TRADE_TO_ATTEST } from "../config";
import { setLoggingEnabled } from "viem/actions";

interface Token {
  id: string;
  asset: string;
  symbol: string;
  market_price: number;
  trade_price: number;
  rating: number;
}
// Type for the data fetched from Binance API (Kline data)
type KlineData = [
  number,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
];

const TokenList = ({ tokenData }: { tokenData: any }) => {
  const [tokens, setTokens] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const tokensd=[
      {
        asset:"ETH",
        price_feed:"$4005",
        market_price:"$4000",
        rating:0}
    ]
    // setTokens(tokensd);

  }, [tokenData]);
  setTimeout(() => {
    const tokensd=[
      {
        asset:"ETH",
        price_feed:"$4005",
        market_price:"$4000",
        rating:0}
    ]
    setTokens((prev) => [
      ...prev,
      {
        asset: "ETH",
        price_feed: "$4005",
        market_price: "$4000",
        rating: 0,
      },
    ]);
  }, 10000);
  const handleRatingChange = (index: number, rating: number) => {
    setLoading(true);
    const updatedTokens = [...tokens];
    updatedTokens[index].rating = rating;
    console.log(
      `Rating for token ${updatedTokens[index]} changed to ${rating}`
    );
    setTimeout(() => {
      setLoading(false);
      setTokens(updatedTokens);
    }, 1000);
  };

  return (
    <div className="flex flex-col space-y-4">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 backdrop-blur-sm z-50">
          <div className="text-white text-lg font-semibold">Loading...</div>
        </div>
      )}{" "}
      <div className="flex items-center justify-center align-center">
        <ETHChart />
      </div>
      <div className="flex items-center font-bold text-lg text-white bg-gray-700 p-4 rounded-lg">
        <span className="flex-1">Token Name</span>
        <span className="flex-1">Price Feed</span>
        <span className="flex-1">Marketplace Price</span>
        <span className="flex-1">Rating</span>
      </div>
      {tokens?.map((token, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 border rounded-lg bg-gray-800"
        >
          <span className="text-xl text-white font-semibold flex-1">
            {token.asset}
          </span>
          <span className="text-lg text-gray-300 flex-1">
            {token.trade_price}
          </span>
          <span className="text-lg text-gray-300 flex-1">
            {token.market_price}
          </span>
          <div className="flex items-center flex-1">
            {[...Array(5)].map((_, starIndex) => (
              <svg
                key={starIndex}
                onClick={() => handleRatingChange(index, starIndex + 1)}
                className={`h-6 w-6 cursor-pointer ${
                  starIndex <= token.rating
                    ? "text-yellow-400"
                    : "text-gray-400"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 15l-5.878 3.09 1.12-6.537L0 6.545l6.545-.954L10 0l2.455 5.591L20 6.545l-5.242 4.003 1.12 6.537z" />
              </svg>
            ))}
            <span className="text-lg text-gray-300 ml-2">{token.rating}</span>
          </div>
         
        </div>
      ))}
    </div>
  );
};

export default function DexPage() {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartData, setChartData] = useState<{ data: number[] } | null>(null);
  const [tokenData, setTokenData] = useState<any>(null);

  const handleTokenClick = (token: Token) => {
    setSelectedToken(token);
    setIsModalOpen(true);
  };

  const processETHData = (klineData: KlineData[]) => {
    const labels = klineData.map((item) => {
      const date = new Date(item[0]);
      return date.toLocaleTimeString(); // You can change this to `toLocaleDateString()` for dates
    });
    const closePrices = klineData.map((item) => parseFloat(item[4]));

    const last10Prices = closePrices.slice(-10);
    return {
      data: last10Prices,
    };
  };

  const fetchData = async () => {
    const url = "https://api.binance.com/api/v3/klines";
    const params = {
      symbol: "ETHUSDT",
      interval: "1h",
      limit: 168,
    };

    try {
      const response = await axios.get<KlineData[]>(url, { params });
      const processedData = processETHData(response.data);
      setChartData(processedData);
      return processedData;
    } catch (error) {
      console.error("Error fetching ETH prices from Binance:", error);
    }
  };

  const attestAPI = async (data: any) => {
    const body = {
      data: data,
    };
    try {
      const response = await axios.post("http://localhost:8000/attest", body);
      console.log("attest api response:", response.data);
    } catch (error) {
      console.error("Error attesting data:", error);
    }
  };

  const uploadQuestions = async () => {
    try {
      // Fetch the price feed (ensure fetchData is working as expected)
      const price_feed = await fetchData();
      if (!price_feed || !price_feed.data) {
        console.error("Price feed data is not available.");
        return;
      }
  
      // Retrieve answers from localStorage and handle potential null value
      const answers = localStorage.getItem("answers");
      if (!answers) {
        console.error("No answers found in localStorage.");
        return;
      }
  
      console.log(chartData);
      let body: any = {
        answers: answers,
        price_feed: JSON.stringify(price_feed.data),
      };
      const response = await axios.post("http://localhost:5000/trade", body, {
        headers: {
          "Content-Type": "application/json",  // Explicitly set content-type
        },
      });
      
  
      const data = response.data;
      console.log(data);
      let tokenData = localStorage.getItem("tokenData");
    var tokenDataArr = tokenData ? JSON.parse(tokenData) : [];
    if(tokenData){

      if (tokenData.length > 0) {
        tokenDataArr.push({
          asset: data.asset,
          trade_price: data.trade_price,
          market_price: data.market_price,
          rating: 0,
        });
      } else {
        tokenDataArr = [{
          asset: data.asset,
          trade_price: data.trade_price,
          market_price: data.market_price,
          rating: 0,
        }];
      }
    }

  // Update localStorage with the new tokenData
  localStorage.setItem("tokenData", JSON.stringify(tokenDataArr));
      await attestAPI(data);
  
    } catch (error) {
      console.error("Error uploading questions:", error);
    }
  };
  

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedToken(null);
  };

  const handleRatingChange = (rating: number) => {
    console.log(`Rating changed to ${rating}`);
  };
  useEffect(() => {
    uploadQuestions();
  }, [TRADE_TO_ATTEST]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-8">
      <div className="max-w-7xl mx-auto">
        <Typography variant="h3" component="h1" className="text-white mb-8">
          DEX Trading
        </Typography>

        {/* <Paper elevation={3} className="w-full p-4">
          <List>
            {mockTokens.map((token) => (
              <ListItem
                key={token.id}
                onClick={() => handleTokenClick(token)}
                className="cursor-pointer hover:bg-gray-100 rounded-lg mb-2"
              >
                <ListItemText
                  primary={
                    <span className="text-lg font-semibold">
                      {token.name} ({token.symbol})
                    </span>
                  }
                  secondary={
                    <span className={`${token.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${token.price.toLocaleString()} | {token.change24h}%
                    </span>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper> */}

        <TokenList tokenData={tokenData} />
      </div>

      {/* <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="token-modal"
      >
        <Box className="absolute top-1/2 left-[75%] transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl w-[45%] max-w-2xl">
          <Typography variant="h5" component="h2" gutterBottom>
            {selectedToken?.name} ({selectedToken?.symbol})
          </Typography>

          <div className="my-6">
            <LineChart width={500} height={300} data={mockChartData}>
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
            <div className="flex items-center flex-1">
              {[...Array(5)].map((_, starIndex) => (
                <svg
                  key={starIndex}
                  onClick={() => handleRatingChange(starIndex + 1)}
                  className={`h-6 w-6 cursor-pointer ${
                    starIndex <= 3 ? "text-yellow-400" : "text-gray-400"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 15l-5.878 3.09 1.12-6.537L0 6.545l6.545-.954L10 0l2.455 5.591L20 6.545l-5.242 4.003 1.12 6.537z" />
                </svg>
              ))}
              <span className="text-lg text-gray-300 ml-2">3</span>
            </div>
          </div>
        </Box>
      </Modal> */}
    </div>
  );
}
