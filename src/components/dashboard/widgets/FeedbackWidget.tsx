import { memo } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const FeedbackWidget = () => {
    return (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Bugs? Feature requests? We like to hear from you.
            </Typography>
            <Button
                variant="outlined"
                size="small"
                startIcon={<OpenInNewIcon />}
                href="https://github.com/simonbuechi/sport/issues"
                target="_blank"
                rel="noopener noreferrer"
            >
                Feedback
            </Button>
        </Box>
    );
};

export default memo(FeedbackWidget);
