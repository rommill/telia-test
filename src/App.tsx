// Crypto Portfolio App - Dark/Light Theme Support
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
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Switch,
  FormControlLabel,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { TableSkeleton } from "./components/TableSkeleton";
import { AppStore } from "./stores/AppStore";
import { observer } from "mobx-react-lite";
import { lightTheme, darkTheme } from "./theme/theme";

const App = observer(() => {
  const [store] = useState(() => new AppStore());
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleSubmit = async () => {
    await store.addToPortfolio();
  };

  const handleCoinSelect = (coinName: string) => {
    const coin = store.getCoinByName(coinName);
    store.setSelectedCoin(coin || null);
  };

  const currentTheme = store.darkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Crypto Portfolio
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {!isMobile && (
                <Typography variant="body2" sx={{ mr: 1, color: "white" }}>
                  {store.darkMode ? "Dark" : "Light"}
                </Typography>
              )}
              <Switch
                checked={store.darkMode}
                onChange={store.toggleDarkMode}
                color="default"
              />
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {store.error && (
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    bgcolor: "error.light",
                    color: "error.contrastText",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography>⚠️ {store.error}</Typography>
                    <Button
                      size="small"
                      onClick={() => store.clearError()}
                      color="inherit"
                    >
                      Dismiss
                    </Button>
                  </Box>
                </Paper>
              )}
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      freeSolo
                      options={store.filteredCoins.map((coin) => coin.name)}
                      value={store.coinName}
                      onInputChange={(_, value) =>
                        store.setCoinName(value || "")
                      }
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

                  <Grid item xs={isMobile ? 7 : 8} md={3}>
                    <TextField
                      label="Amount"
                      variant="outlined"
                      type="number"
                      fullWidth
                      value={store.coinAmount === 0 ? "" : store.coinAmount}
                      onChange={(e) => store.setCoinAmount(e.target.value)}
                      onBlur={(e) => {
                        if (
                          e.target.value === "" ||
                          isNaN(parseFloat(e.target.value))
                        ) {
                          store.setCoinAmount("0");
                        }
                      }}
                      placeholder="0.5, 1, 2.5"
                      inputProps={{
                        min: "0",
                        step: "0.1",
                      }}
                    />
                  </Grid>

                  <Grid item xs={isMobile ? 5 : 4} md={3}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleSubmit}
                      disabled={!store.selectedCoin || store.coinAmount <= 0}
                      sx={{ height: 56 }}
                    >
                      {isMobile ? "Add" : "Add to Portfolio"}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Your Portfolio</Typography>
                  {store.portfolio.length > 0 && (
                    <Button
                      variant="outlined"
                      onClick={() => store.updateAllPrices()}
                      disabled={store.loading}
                      startIcon={
                        store.loading ? <CircularProgress size={16} /> : null
                      }
                    >
                      {store.loading ? "Updating..." : "Refresh Prices"}
                    </Button>
                  )}
                </Box>

                <TableContainer className="mobile-table-container">
                  <Table sx={{ minWidth: 600 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Coin</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {store.portfolio.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                            <Typography color="textSecondary">
                              Your portfolio is empty
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          {store.portfolio.map((item) => (
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
                                  onClick={() =>
                                    store.removeFromPortfolio(item.id)
                                  }
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3}>
                              <Typography variant="subtitle1">
                                Total Value:
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="subtitle1">
                                ${store.totalPortfolioValue.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Available Cryptocurrencies
                </Typography>

                <TextField
                  label="Search..."
                  variant="outlined"
                  fullWidth
                  value={store.searchQuery}
                  onChange={(e) => store.setSearchQuery(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="Search by name or symbol"
                  InputProps={{
                    endAdornment: store.searchQuery && (
                      <Button
                        size="small"
                        onClick={() => store.setSearchQuery("")}
                      >
                        Clear
                      </Button>
                    ),
                  }}
                />

                {store.loading ? (
                  <TableSkeleton />
                ) : (
                  <TableContainer className="mobile-table-container">
                    <Table sx={{ minWidth: 400 }}>
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
                              "&:hover": { backgroundColor: "action.hover" },
                            }}
                            onClick={() => handleCoinSelect(coin.name)}
                          >
                            <TableCell>{coin.name}</TableCell>
                            <TableCell align="right">{coin.symbol}</TableCell>
                            <TableCell align="right">{coin.rank}</TableCell>
                          </TableRow>
                        ))}
                        {store.filteredCoins.length === 0 &&
                          store.searchQuery && (
                            <TableRow>
                              <TableCell
                                colSpan={3}
                                align="center"
                                sx={{ py: 4 }}
                              >
                                <Typography color="textSecondary">
                                  No results for "{store.searchQuery}"
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </div>
    </ThemeProvider>
  );
});

export default App;
