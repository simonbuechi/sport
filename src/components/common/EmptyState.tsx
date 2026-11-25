import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    compact?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actions,
    compact = false,
}) => {
    return (
        <Paper
            variant="outlined"
            sx={{
                py: compact ? 3.5 : { xs: 4, sm: 6 },
                px: { xs: 2.5, sm: 4 },
                textAlign: 'center',
                bgcolor: 'background.paper',
            }}
        >
            {icon && (
                <Box
                    sx={{
                        color: 'text.secondary',
                        opacity: 0.55,
                        mb: 1.5,
                        display: 'flex',
                        justifyContent: 'center',
                        '& .MuiSvgIcon-root': { fontSize: compact ? 40 : 52 },
                    }}
                >
                    {icon}
                </Box>
            )}
            <Typography variant={compact ? 'subtitle1' : 'h6'} sx={{ mb: description || actions ? 0.75 : 0 }}>
                {title}
            </Typography>
            {description && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ maxWidth: 460, mx: 'auto', mb: actions ? 2.5 : 0 }}
                >
                    {description}
                </Typography>
            )}
            {actions && (
                <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                    {actions}
                </Stack>
            )}
        </Paper>
    );
};

export default EmptyState;
