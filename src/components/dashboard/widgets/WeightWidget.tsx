import { memo, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useUserProfile } from '../../../hooks/useUserProfile';

const WeightWidget = () => {
    const { profile } = useUserProfile();
    const weights = profile?.weights ?? [];

    const stats = useMemo(() => {
        if (weights.length === 0) return null;

        const latestEntry = [...weights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        const latestWeight = latestEntry.weightKg;

        // Find entry closest to 1 month ago
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        let closestEntry = weights[0];
        let minDiff = Math.abs(new Date(weights[0].date).getTime() - oneMonthAgo.getTime());

        for (const entry of weights) {
            const diff = Math.abs(new Date(entry.date).getTime() - oneMonthAgo.getTime());
            if (diff < minDiff) {
                minDiff = diff;
                closestEntry = entry;
            }
        }

        // Only show change if the closest entry is at least 7 days away from the latest entry to make it meaningful
        const daysDiff = Math.abs(new Date(latestEntry.date).getTime() - new Date(closestEntry.date).getTime()) / (1000 * 60 * 60 * 24);
        
        let changeText = '';
        if (daysDiff >= 7 && latestEntry.id !== closestEntry.id) {
            const change = latestWeight - closestEntry.weightKg;
            const sign = change >= 0 ? '+' : '';
            changeText = `${sign}${change.toFixed(1)}kg in last month`;
        }

        return {
            latestWeight,
            changeText
        };
    }, [weights]);

    if (!stats) {
        return (
            <Typography variant="body2" color="text.secondary">
                No weight data yet. Add your weight in the profile section.
            </Typography>
        );
    }

    return (
        <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {stats.latestWeight}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                    kg
                </Typography>
            </Box>
            {stats.changeText && (
                <Typography variant="body2" color="text.secondary">
                    {stats.changeText}
                </Typography>
            )}
        </Stack>
    );
};

export default memo(WeightWidget);
