import { memo } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { useTranslation } from 'react-i18next';

interface WorkoutCounterWidgetProps {
    sessionsInLast7Days: number;
}

const WorkoutCounterWidget = ({ sessionsInLast7Days }: WorkoutCounterWidgetProps) => {
    const { t } = useTranslation();

    return (
        <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {sessionsInLast7Days}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                    {sessionsInLast7Days === 1 ? t('widgets.workout_one') : t('widgets.workout_other')}
                </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
                {t('widgets.inLast7Days')}
            </Typography>
        </Stack>
    );
};

export default memo(WorkoutCounterWidget);
