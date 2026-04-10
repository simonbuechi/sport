import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface SessionCounterWidgetProps {
    sessionsInLast7Days: number;
    aspirationalMessage: string;
}

const SessionCounterWidget = ({ sessionsInLast7Days, aspirationalMessage }: SessionCounterWidgetProps) => {
    return (
        <Box>
            <Typography variant="body2" gutterBottom >
                You have done <strong>{sessionsInLast7Days}</strong> sport {sessionsInLast7Days === 1 ? 'session' : 'sessions'} in the last 7 days.
            </Typography>
            <Typography variant="body2" color="primary" sx={{ fontStyle: 'italic', mt: 2, fontWeight: 500 }}>
                &ldquo;{aspirationalMessage}&rdquo;
            </Typography>
        </Box>
    );
};

export default SessionCounterWidget;
