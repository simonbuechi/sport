import { memo } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

const ProjectUpdatesWidget = () => {
    return (
        <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                v0.2 April 2026: Alpha Version, use with caution
            </Typography>
            <Link
                href="https://github.com/simonbuechi/sport"
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
            >
                View project repo
            </Link>
        </Box>
    );
};

export default memo(ProjectUpdatesWidget);
