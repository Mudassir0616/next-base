import { Skeleton } from "@mui/material";
import React from "react";

const CardSkeletons = () => {
  return (
    <>
      <Skeleton variant="rounded" width={300} height={200} />
      <Skeleton />
      <Skeleton width="60%" />
    </>
  );
};

export default CardSkeletons;
