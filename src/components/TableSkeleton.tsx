import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Box,
} from "@mui/material";

export const TableSkeleton: React.FC = () => {
  return (
    <TableContainer component={Paper} className="mobile-table-container">
      <Table sx={{ minWidth: 400 }}>
        <TableHead>
          <TableRow>
            <TableCell>
              <Skeleton variant="text" />
            </TableCell>
            <TableCell align="right">
              <Skeleton variant="text" width={60} />
            </TableCell>
            <TableCell align="right">
              <Skeleton variant="text" width={80} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="text" width={120} height={30} />
                </Box>
              </TableCell>
              <TableCell align="right">
                <Skeleton variant="text" width={60} height={30} />
              </TableCell>
              <TableCell align="right">
                <Skeleton variant="text" width={80} height={30} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
