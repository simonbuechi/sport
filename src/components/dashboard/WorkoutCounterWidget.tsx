import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface WorkoutCounterWidgetProps {
    sessionsInLast7Days: number;
    aspirationalMessage: string;
}

const WorkoutCounterWidget = ({ sessionsInLast7Days, aspirationalMessage }: WorkoutCounterWidgetProps) => {
    return (
        <Box>
            <Typography variant="body2" gutterBottom >
                You have done <strong>{sessionsInLast7Days}</strong> sport {sessionsInLast7Days === 1 ? 'workout' : 'workouts'} in the last 7 days.
            </Typography>
            <Typography variant="body2" color="primary" sx={{ mt: 2, }}>
                &ldquo;{aspirationalMessage}&rdquo;
            </Typography>
        </Box>
    );
};

export default WorkoutCounterWidget;
