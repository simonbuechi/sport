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
    const fontSize = size === 'small' ? '1.15rem' : '1.35rem';
    const shadowFilter = withShadow ? 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))' : undefined;

    if (!status.favorite) return null;

    return (
        <Stack direction="row" spacing={0.5} sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <Tooltip title="Favorite">
                <Star sx={{ color: 'warning.main', fontSize, filter: shadowFilter }} />
            </Tooltip>
        </Stack>
    );
};

export default memo(MarkerIcons);
