import React, { useState } from "react";
import "./App.css";
import {
  Button,
  Container,
  Grid,
  TextField,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableBody,
  Autocomplete,
  CircularProgress,
  Typography,
} from "@mui/material";
import { TableSkeleton } from "./components/TableSkeleton";
import { AppStore } from "./stores/AppStore";
import { observer } from "mobx-react-lite";

const App = observer(() => {
  const [store] = useState(() => new AppStore());

  const handleSubmit = async () => {
    await store.addToPortfolio();
  };

  const handleCoinSelect = (coinName: string) => {
    const coin = store.getCoinByName(coinName);
    store.setSelectedCoin(coin || null);
  };

  return (
    <div className="App">
      <Container maxWidth="md">
        <Grid container direction="column" spacing={3}>
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              Crypto Portfolio
            </Typography>
            {store.error && (
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#ffebee",
                  border: "1px solid #f44336",
                  borderRadius: "4px",
                  marginBottom: "16px",
                }}
              >
                <Typography color="error">⚠️ {store.error}</Typography>
                <Button
                  size="small"
                  onClick={() => store.clearError()}
                  style={{ marginTop: "8px" }}
                >
                  Dismiss
                </Button>
              </div>
            )}
          </Grid>

          <Grid item container spacing={2}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={store.filteredCoins.map((coin) => coin.name)}
                value={store.coinName}
                onInputChange={(_, value) => store.setCoinName(value || "")}
                onChange={(_, value) => handleCoinSelect(value || "")}
                loading={store.loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Coin name"
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {store.loading ? (
                            <CircularProgress size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Amount"
                variant="outlined"
                type="number"
                fullWidth
                value={store.coinAmount}
                onChange={(e) => store.setCoinAmount(e.target.value)}
                placeholder="0.5, 1, 2.5..."
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                disabled={!store.selectedCoin || store.coinAmount <= 0}
                sx={{ height: "56px" }}
              >
                Add to Portfolio
              </Button>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Your Portfolio
            </Typography>
            {store.portfolio.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <Button
                  variant="outlined"
                  onClick={() => store.updateAllPrices()}
                  disabled={store.loading}
                  startIcon={
                    store.loading ? <CircularProgress size={16} /> : null
                  }
                >
                  {store.loading ? "Updating Prices..." : "Refresh All Prices"}
                </Button>
              </div>
            )}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Coin Name</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Current Price</TableCell>
                    <TableCell align="right">Total Value</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {store.portfolio.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="textSecondary">
                          Your portfolio is empty. Add some coins above!
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    store.portfolio.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.coinName}</TableCell>
                        <TableCell align="right">{item.amount}</TableCell>
                        <TableCell align="right">
                          ${item.price ? item.price.toFixed(2) : "N/A"}
                        </TableCell>
                        <TableCell align="right">
                          $
                          {item.price
                            ? (item.amount * item.price).toFixed(2)
                            : "N/A"}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              store.removeFromPortfolio(item.id);
                            }}
                            sx={{ minWidth: "80px" }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {store.portfolio.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="subtitle1">
                          Total Portfolio Value:
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1">
                          ${store.totalPortfolioValue.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell></TableCell>{" "}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Available Cryptocurrencies
            </Typography>
            <TextField
              label="Search cryptocurrencies..."
              variant="outlined"
              fullWidth
              value={store.searchQuery}
              onChange={(e) => store.setSearchQuery(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Search by name or symbol..."
              InputProps={{
                endAdornment: store.searchQuery ? (
                  <Button size="small" onClick={() => store.setSearchQuery("")}>
                    Clear
                  </Button>
                ) : null,
              }}
            />

            {store.loading ? (
              <TableSkeleton />
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell align="right">Symbol</TableCell>
                      <TableCell align="right">Rank</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {store.filteredCoins.map((coin) => (
                      <TableRow
                        key={coin.id}
                        sx={{
                          cursor: "pointer",
                          "&:hover": { backgroundColor: "#f5f5f5" },
                        }}
                        onClick={() => handleCoinSelect(coin.name)}
                      >
                        <TableCell>{coin.name}</TableCell>
                        <TableCell align="right">{coin.symbol}</TableCell>
                        <TableCell align="right">{coin.rank}</TableCell>
                      </TableRow>
                    ))}
                    {store.filteredCoins.length === 0 && store.searchQuery && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          {" "}
                          <Typography color="textSecondary">
                            No cryptocurrencies found for "{store.searchQuery}"
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
        </Grid>
      </Container>
    </div>
  );
});

export default App;
