import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { log } from "console";
import { CHART_REFRESH_INTERVAL } from "../config";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    fill: boolean;
    tension: number;
  }[];
}

const ETHChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
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
      } catch (error) {
        console.error("Error fetching ETH prices from Binance:", error);
      }
    };

    fetchData();
  }, [CHART_REFRESH_INTERVAL]);
  useEffect(() => {
    console.log(chartData);
  }, [chartData]);
 const processETHData = (klineData: KlineData[]): ChartData => {
    const labels = klineData.map((item) => {
      const date = new Date(item[0]);
      return date.toLocaleTimeString(); // or use `toLocaleDateString()` for the date
    });

    const closePrices = klineData.map((item) => parseFloat(item[4])); // Close price is at index 4

    return {
      labels,
      datasets: [
        {
          label: "ETH Price (USD)",
          data: closePrices,
          borderColor: "#42A5F5",
          fill: false,
          tension: 0.1,
        },
      ],
    };
  };

  if (!chartData) return <div>Loading...</div>;

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <Line data={chartData} />
    </div>
  );
};

export default ETHChart;
