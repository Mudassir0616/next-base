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
} from "@mui/material";

const TableSkeleton = () => {
  // Number of rows and columns in the table
  const rows = 12; // adjust according to the number of rows you want to show in the skeleton
  const columns = [
    "ID",
    "Date",
    "Category",
    "Threat Type",
    "Artifacts",
    "Severity",
  ];

  return (
    <TableContainer
      component={Paper}
      style={{ backgroundColor: "#121212", color: "#ffffff" }}
    >
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell key={index} style={{ color: "#ffffff" }}>
                <Skeleton
                  variant="text"
                  animation="wave"
                  sx={{ backgroundColor: "#B3B3B3", opacity: "0.5" }}
                  width={`100%`} // Random widths for header skeletons
                />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton
                    variant="text"
                    animation="wave"
                    sx={{ backgroundColor: "#B5B5B5", opacity: "0.1" }}
                    width={`100%`} // Random widths for cell skeletons
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableSkeleton;
