import { Box, Skeleton } from '@mui/material';
import React from 'react';

const GridSkeleton = () => {
    const skeletonArray = [1, 2, 3];

    return (
        <div
            className='grid-skeleton'
            style={{ display: 'flex', justifyContent: 'flex-start', overflow: 'hidden', gap: '20px', marginTop: '20px' }}
        >
            {skeletonArray.map((index) => (
                <Box key={index} sx={{ pt: 0.5 }}>
                    <Skeleton variant="rectangular" width={300} height={200} />
                    <Skeleton />
                    <Skeleton width="60%" />
                </Box>
            ))}
        </div>
    );
};

export default GridSkeleton;
