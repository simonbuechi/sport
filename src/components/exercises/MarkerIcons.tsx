import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Rating from '@mui/material/Rating';

import Favorite from '@mui/icons-material/Favorite';
import School from '@mui/icons-material/School';
import MenuBook from '@mui/icons-material/MenuBook';
import type { MarkedStatus } from '../../types';

interface MarkerIconsProps {
    status: MarkedStatus;
    size?: 'small' | 'medium';
    withShadow?: boolean;
}

const MarkerIcons = ({ status, size = 'small', withShadow = false }: MarkerIconsProps) => {
    const fontSize = size === 'small' ? '1.2rem' : '1.4rem';
    const shadowFilter = withShadow ? 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))' : undefined;

    const hasMarkers = (status.favorite ?? false) || (status.learning ?? false) || (status.toLearn ?? false);
    const hasSkill = status.skillLevel !== undefined;

    if (!hasMarkers && !hasSkill) return null;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {status.favorite && (
                <Tooltip title="Favorite">
                    <Favorite sx={{ color: withShadow ? '#ff4081' : 'error.main', fontSize, filter: shadowFilter }} />
                </Tooltip>
            )}
            {status.learning && (
                <Tooltip title="Currently Learning">
                    <School sx={{ color: withShadow ? '#64b5f6' : 'primary.main', fontSize, filter: shadowFilter }} />
                </Tooltip>
            )}
            {status.toLearn && (
                <Tooltip title="To Learn">
                    <MenuBook sx={{ color: withShadow ? '#e0e0e0' : 'secondary.main', fontSize, filter: shadowFilter }} />
                </Tooltip>
            )}
            {hasSkill && (
                <Tooltip title={`Skill Level: ${String(status.skillLevel)}`}>
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: hasMarkers ? 0.5 : 0 }}>
                        <Rating
                            value={status.skillLevel ?? 0}
                            readOnly
                            size="small"
                            sx={{
                                fontSize: '1rem',
                                '& .MuiRating-icon': {
                                    filter: shadowFilter,
                                },
                            }}
                        />
                    </Box>
                </Tooltip>
            )}
        </Box>
    );
};

export default MarkerIcons;
