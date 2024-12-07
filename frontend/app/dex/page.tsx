'use client';

import { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText, 
  Paper,
} from '@mui/material';
import {  Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart } from 'recharts';

interface Token {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
}

const mockTokens: Token[] = [
  { id: '1', name: 'Bitcoin', symbol: 'BTC', price: 43000, change24h: 2.5 },
  { id: '2', name: 'Ethereum', symbol: 'ETH', price: 2200, change24h: 1.8 },
  { id: '3', name: 'Solana', symbol: 'SOL', price: 120, change24h: 5.2 },
];

const mockChartData = [
  { time: '00:00', price: 100 },
  { time: '04:00', price: 120 },
  { time: '08:00', price: 110 },
  { time: '12:00', price: 130 },
  { time: '16:00', price: 140 },
  { time: '20:00', price: 135 },
];

const TokenList = () => {
  const [tokens, setTokens] = useState([
    { name: 'Token A', priceFeed: '$10', marketplacePrice: '$9', rating: 4 },
    { name: 'Token B', priceFeed: '$20', marketplacePrice: '$18', rating: 5 },
    { name: 'Token C', priceFeed: '$5', marketplacePrice: '$4', rating: 3 },
    { name: 'Token D', priceFeed: '$15', marketplacePrice: '$14', rating: 2 },
  ]);
 
  const handleRatingChange = (index: number, rating: number) => {
    const updatedTokens = [...tokens];
    updatedTokens[index].rating = rating;
    setTokens(updatedTokens);
    console.log(`Rating for token ${updatedTokens[index]} changed to ${rating}`);
  };

  return (
    <div className="flex flex-col space-y-4">
    <LineChart width={500} height={300} data={mockChartData}>
    <XAxis dataKey="name"/>
    <YAxis/>
    <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
    <Line type="monotone" dataKey="uv" stroke="#8884d8" />
    <Line type="monotone" dataKey="pv" stroke="#82ca9d" />
  </LineChart>
    
      <div className="flex items-center font-bold text-lg text-white bg-gray-700 p-4 rounded-lg">
        <span className="flex-1">Token Name</span>
        <span className="flex-1">Price Feed</span>
        <span className="flex-1">Marketplace Price</span>
        <span className="flex-1">Rating</span>
      </div>
      {tokens.map((token, index) => (
        <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-800">
          <span className="text-xl text-white font-semibold flex-1">{token.name}</span>
          <span className="text-lg text-gray-300 flex-1">{token.priceFeed}</span>
          <span className="text-lg text-gray-300 flex-1">{token.marketplacePrice}</span>
          <div className="flex items-center flex-1">
            {[...Array(5)].map((_, starIndex) => (
              <svg key={starIndex} onClick={() => handleRatingChange(index, starIndex + 1)} className={`h-6 w-6 cursor-pointer ${starIndex <= token.rating ? 'text-yellow-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 15l-5.878 3.09 1.12-6.537L0 6.545l6.545-.954L10 0l2.455 5.591L20 6.545l-5.242 4.003 1.12 6.537z" />
              </svg>
            ))}
            <span className="text-lg text-gray-300 ml-2">{token.rating}</span>
          </div>
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Bought</button>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Sold</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function DexPage() {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTokenClick = (token: Token) => {
    setSelectedToken(token);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedToken(null);
  };

  const handleRatingChange = (rating: number) => {
    console.log(`Rating changed to ${rating}`);
  };

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

        <TokenList />
      </div>

      <Modal
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
                <svg key={starIndex} onClick={() => handleRatingChange(starIndex + 1)} className={`h-6 w-6 cursor-pointer ${starIndex <= 3 ? 'text-yellow-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 15l-5.878 3.09 1.12-6.537L0 6.545l6.545-.954L10 0l2.455 5.591L20 6.545l-5.242 4.003 1.12 6.537z" />
                </svg>
              ))}
              <span className="text-lg text-gray-300 ml-2">3</span>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}