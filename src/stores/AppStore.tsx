import {
  action,
  computed,
  observable,
  makeObservable,
  runInAction,
} from "mobx";
import { coinPaprika } from "../api/coinPaprika";
import { Coin, PortfolioItem } from "../models/Coin";

interface CoinPriceResponse {
  id: string;
  name: string;
  symbol: string;
  rank: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  beta_value: number;
  first_data_at: string;
  last_updated: string;
  quotes: {
    USD: {
      price: number;
      volume_24h: number;
      volume_24h_change_24h: number;
      market_cap: number;
      market_cap_change_24h: number;
      percent_change_15m: number;
      percent_change_30m: number;
      percent_change_1h: number;
      percent_change_6h: number;
      percent_change_12h: number;
      percent_change_24h: number;
      percent_change_7d: number;
      percent_change_30d: number;
      percent_change_1y: number;
      ath_price: number;
      ath_date: string;
      percent_from_price_ath: number;
    };
  };
}

export class AppStore {
  @observable protected _coinName: string = "";
  @observable protected _coinAmount: number = 0;
  @observable coins: Coin[] = [];
  @observable loading: boolean = false;
  @observable error: string | null = null;
  @observable portfolio: PortfolioItem[] = [];
  @observable selectedCoin: Coin | null = null;
  @observable addingToPortfolio: boolean = false;

  constructor() {
    makeObservable(this);
    this.fetchCoins();
  }

  @computed
  get coinName(): string {
    return this._coinName;
  }

  @computed
  get coinAmount(): number {
    return this._coinAmount;
  }

  @computed
  get filteredCoins(): Coin[] {
    if (!this._coinName) return this.coins.slice(0, 10);

    return this.coins
      .filter(
        (coin) =>
          coin.name.toLowerCase().includes(this._coinName.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(this._coinName.toLowerCase())
      )
      .slice(0, 10);
  }

  @computed
  get totalPortfolioValue(): number {
    return this.portfolio.reduce((total, item) => {
      return total + item.amount * (item.price || 0);
    }, 0);
  }

  @action setCoinName = (coinName: string) => {
    this._coinName = coinName;
  };

  @action setCoinAmount = (amount: string) => {
    this._coinAmount = parseFloat(amount) || 0;
  };

  @action setSelectedCoin = (coin: Coin | null) => {
    this.selectedCoin = coin;
    if (coin) {
      this._coinName = coin.name;
    }
  };

  @action
  fetchCoinPrice = async (coinId: string): Promise<number> => {
    try {
      const response = await coinPaprika.getCoinPrice(coinId);
      const data = response.data as CoinPriceResponse;
      return data.quotes.USD.price;
    } catch (error) {
      console.error("Failed to fetch coin price:", error);
      return 0;
    }
  };

  @action addToPortfolio = async () => {
    if (!this.selectedCoin || this._coinAmount <= 0) return;

    this.addingToPortfolio = true;

    try {
      const currentPrice = await this.fetchCoinPrice(this.selectedCoin.id);

      const portfolioItem: PortfolioItem = {
        id: Math.random().toString(36).substr(2, 9),
        coinId: this.selectedCoin.id,
        coinName: this.selectedCoin.name,
        amount: this._coinAmount,
        price: currentPrice,
      };

      this.portfolio.push(portfolioItem);

      this._coinName = "";
      this._coinAmount = 0;
      this.selectedCoin = null;
    } catch (error) {
      console.error("Failed to add to portfolio:", error);
    } finally {
      runInAction(() => {
        this.addingToPortfolio = false;
      });
    }
  };

  @action removeFromPortfolio = (portfolioItemId: string) => {
    this.portfolio = this.portfolio.filter(
      (item) => item.id !== portfolioItemId
    );
  };

  @action updatePortfolioItemPrice = async (portfolioItemId: string) => {
    const item = this.portfolio.find((item) => item.id === portfolioItemId);
    if (item) {
      const currentPrice = await this.fetchCoinPrice(item.coinId);
      runInAction(() => {
        item.price = currentPrice;
      });
    }
  };

  @action updateAllPrices = async () => {
    const updatePromises = this.portfolio.map(async (item) => {
      const currentPrice = await this.fetchCoinPrice(item.coinId);
      return { item, currentPrice };
    });

    const results = await Promise.all(updatePromises);

    runInAction(() => {
      results.forEach(({ item, currentPrice }) => {
        item.price = currentPrice;
      });
    });
  };

  getCoinByName(name: string): Coin | undefined {
    return this.coins.find((coin) => coin.name === name);
  }

  getCoinById(id: string): Coin | undefined {
    return this.coins.find((coin) => coin.id === id);
  }

  @action
  fetchCoins = async () => {
    this.loading = true;
    this.error = null;

    try {
      const response = await coinPaprika.getCoins();
      runInAction(() => {
        this.coins = response.data.slice(0, 100);
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = "Failed to fetch coins";
        this.loading = false;
      });
    }
  };

  @action clearError = () => {
    this.error = null;
  };

  @action clearPortfolio = () => {
    this.portfolio = [];
  };
}
