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
  @observable searchQuery: string = "";
  @observable darkMode: boolean = false;

  constructor() {
    makeObservable(this);
    this.loadPortfolio();
    this.loadTheme();
    this.loadCoins();
  }

  savePortfolio() {
    localStorage.setItem("crypto-portfolio", JSON.stringify(this.portfolio));
  }

  loadPortfolio() {
    const saved = localStorage.getItem("crypto-portfolio");
    if (saved) {
      try {
        this.portfolio = JSON.parse(saved);
      } catch (error) {
        console.error("Failed to load portfolio:", error);
        this.error = "Failed to load saved portfolio";
      }
    }
  }

  loadTheme() {
    const saved = localStorage.getItem("darkMode");
    if (saved) {
      try {
        this.darkMode = JSON.parse(saved);
      } catch (error) {
        console.error("Failed to load theme:", error);
      }
    }
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
    if (!this.searchQuery && !this._coinName) return this.coins.slice(0, 10);

    const query = this.searchQuery || this._coinName;

    return this.coins
      .filter(
        (coin) =>
          coin.name.toLowerCase().includes(query.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(query.toLowerCase())
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

  @action setSearchQuery = (query: string) => {
    this.searchQuery = query;
  };

  @action toggleDarkMode = () => {
    this.darkMode = !this.darkMode;
    localStorage.setItem("darkMode", JSON.stringify(this.darkMode));
  };

  @action
  loadCoins = async () => {
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
        this.error = "Failed to fetch coins. Please try again later.";
        this.loading = false;
      });
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
    this.error = null;

    try {
      const currentPrice = await this.fetchCoinPrice(this.selectedCoin.id);

      const portfolioItem: PortfolioItem = {
        id: Math.random().toString(36).substr(2, 9),
        coinId: this.selectedCoin.id,
        coinName: this.selectedCoin.name,
        amount: this._coinAmount,
        price: currentPrice,
      };

      runInAction(() => {
        this.portfolio.push(portfolioItem);
        this._coinName = "";
        this._coinAmount = 0;
        this.selectedCoin = null;
        this.savePortfolio();
      });
    } catch (error) {
      runInAction(() => {
        this.error = "Failed to add coin to portfolio. Please try again.";
      });
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
    this.savePortfolio();
  };

  @action updatePortfolioItemPrice = async (portfolioItemId: string) => {
    const item = this.portfolio.find((item) => item.id === portfolioItemId);
    if (item) {
      const currentPrice = await this.fetchCoinPrice(item.coinId);
      runInAction(() => {
        item.price = currentPrice;
        this.savePortfolio();
      });
    }
  };

  @action updateAllPrices = async () => {
    this.loading = true;

    try {
      const updatePromises = this.portfolio.map(async (item) => {
        const currentPrice = await this.fetchCoinPrice(item.coinId);
        return { item, currentPrice };
      });

      const results = await Promise.all(updatePromises);

      runInAction(() => {
        results.forEach(({ item, currentPrice }) => {
          item.price = currentPrice;
        });
        this.savePortfolio();
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = "Failed to update prices";
        this.loading = false;
      });
    }
  };

  getCoinByName(name: string): Coin | undefined {
    return this.coins.find((coin) => coin.name === name);
  }

  getCoinById(id: string): Coin | undefined {
    return this.coins.find((coin) => coin.id === id);
  }

  @action clearError = () => {
    this.error = null;
  };

  @action clearPortfolio = () => {
    this.portfolio = [];
    this.savePortfolio();
  };
}
