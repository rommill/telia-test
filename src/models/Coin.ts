export interface Coin {
  id: string;
  name: string;
  symbol: string;
  rank: number;
  is_new: boolean;
  is_active: boolean;
  type: string;
}

export interface PortfolioItem {
  id: string;
  coinId: string;
  coinName: string;
  amount: number;
  price?: number;
}
