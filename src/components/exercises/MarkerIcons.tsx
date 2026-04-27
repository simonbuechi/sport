import { memo } from 'react';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Star from '@mui/icons-material/Star';
import type { MarkedStatus } from '../../types';

interface MarkerIconsProps {
    status: MarkedStatus;
    size?: 'small' | 'medium';
    withShadow?: boolean;
}

const MarkerIcons = ({ status, size = 'small', withShadow = false }: MarkerIconsProps) => {
    const fontSize = size === 'small' ? '1.2rem' : '1.4rem';
    const shadowFilter = withShadow ? 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))' : undefined;

    if (!status.favorite) return null;

    return (
        <Stack spacing={0.5}>
            <Tooltip title="Favorite">
                <Star sx={{ color: 'warning.main', fontSize, filter: shadowFilter }} />
            </Tooltip>
        </Stack>
    );
};

export default memo(MarkerIcons);
