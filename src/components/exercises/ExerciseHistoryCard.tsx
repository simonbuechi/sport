import { Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Button from '@mui/material/Button';
import EventNote from '@mui/icons-material/EventNote';
import type { ActivityLog as JournalEntry } from '../../types';

interface ExerciseHistoryCardProps {
    sessions: JournalEntry[];
}

const ExerciseHistoryCard = ({ sessions }: ExerciseHistoryCardProps) => {
    if (sessions.length === 0) return null;

    return (
        <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Training History</Typography>
            <Divider sx={{ mb: 2 }} />
            <List disablePadding>
                {sessions.map(session => (
                    <ListItem key={session.id} disablePadding sx={{ mb: 1, alignItems: 'flex-start' }}>
                        <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                            <EventNote fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary={new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            secondary={
                                <>
                                    {session.sessionType ?? 'Training Session'}
                                    {session.length ? ` • ${String(session.length)} min` : ''}
                                </>
                            }
                            slotProps={{
                                secondary: { variant: 'caption', sx: { display: 'block' } }
                            }}
                        />
                    </ListItem>
                ))}
            </List>
            <Button
                component={RouterLink}
                to="/journal"
                variant="text"
                fullWidth
                size="small"
                sx={{ mt: 1 }}
            >
                View Full Journal
            </Button>
        </Paper>
    );
};

export default ExerciseHistoryCard;
