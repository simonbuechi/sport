import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface PageHeaderProps {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    backTo?: string;
    backLabel?: string;
    onBack?: () => void;
    actions?: React.ReactNode;
    titleAdornment?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    backTo,
    backLabel,
    onBack,
    actions,
    titleAdornment,
}) => {
    const { t } = useTranslation();

    const showBackButton = Boolean(backTo ?? onBack);

    return (
        <Box sx={{ mb: { xs: 2, md: 3.5 } }}>
            {showBackButton && backLabel && (
                <Button
                    component={backTo ? RouterLink : 'button'}
                    to={backTo}
                    onClick={onBack}
                    startIcon={<ArrowBackIcon fontSize="small" />}
                    size="small"
                    color="inherit"
                    sx={{ mb: 0.75, color: 'text.secondary', px: 1, ml: -1 }}
                >
                    {backLabel}
                </Button>
            )}

            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1.5,
                }}
            >
                <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                        {showBackButton && !backLabel && (
                            <IconButton
                                component={backTo ? RouterLink : 'button'}
                                to={backTo}
                                onClick={onBack}
                                aria-label={t('common.back')}
                                size="small"
                                sx={{ ml: -0.75 }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                        )}
                        <Typography variant="h4" component="h1" sx={{ wordBreak: 'break-word' }}>
                            {title}
                        </Typography>
                        {titleAdornment}
                    </Stack>

                    {subtitle && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>

                {actions && (
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            flexShrink: 0,
                            flexWrap: 'wrap',
                        }}
                    >
                        {actions}
                    </Stack>
                )}
            </Box>
        </Box>
    );
};

export default PageHeader;
