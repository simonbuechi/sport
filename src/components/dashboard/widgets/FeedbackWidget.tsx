import { memo } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { useTranslation } from 'react-i18next';

const FeedbackWidget = () => {
    const { t } = useTranslation();

    return (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('widgets.bugsAndFeatures')}
            </Typography>
            <Button
                variant="outlined"
                size="small"
                startIcon={<OpenInNewIcon />}
                href="https://github.com/simonbuechi/sport/issues"
                target="_blank"
                rel="noopener noreferrer"
            >
                {t('widgets.feedback')}
            </Button>
        </Box>
    );
};

export default memo(FeedbackWidget);
