import axios from "axios";
import { Coin } from "../models/Coin";

const client = axios.create({
  baseURL: "https://api.coinpaprika.com/v1",
});

export const coinPaprika = {
  getCoins: () => client.get<Coin[]>("/coins"),
  getCoinPrice: (coinId: string) => client.get(`/tickers/${coinId}`),
};
