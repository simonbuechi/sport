import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Collapse from '@mui/material/Collapse';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { getJournalEntries, deleteJournalEntry } from '../services/db';
import type { ActivityLog as JournalEntry, Exercise } from '../types';


const Journal = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { exercises, loading: exercisesLoading } = useExercises();

    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
    const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            try {
                setLoading(true);
                const entriesData = await getJournalEntries(currentUser.uid);
                setEntries(entriesData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        void fetchData();
    }, [currentUser]);

    const handleEditClick = (entry: JournalEntry) => {
        void navigate(`/journal/${entry.id}/edit`);
    };

    const toggleExpand = (id: string) => {
        setExpandedEntries(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleDeleteClick = (id: string) => {
        setEntryToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!currentUser || !entryToDelete) return;

        try {
            await deleteJournalEntry(currentUser.uid, entryToDelete);
            setEntries(prev => prev.filter(entry => entry.id !== entryToDelete));
            setDeleteDialogOpen(false);
            setEntryToDelete(null);
        } catch (err) {
            console.error(err);
        }
    };

    // Helper to get exercise name by ID
    const getExerciseName = (id: string) => {
        const t = exercises.find((tech: Exercise) => tech.id === id);
        return t ? t.name : 'Unknown Exercise';
    };

    if (loading || (exercisesLoading && exercises.length === 0)) return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                mt: 8
            }}><CircularProgress /></Box>
    );

    return (
        <Container maxWidth="lg">
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: { xs: 1, md: 2 },
                    mb: { xs: 2, md: 4 }
                }}>
                <Typography variant="h4" component="h1">
                    Journal
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/journal/new')}
                >
                    Add Session
                </Button>
            </Box>
            <Divider sx={{ mb: { xs: 2, md: 4 } }} />
            {/* Journal Entries List */}
            <Box>

                {entries.length === 0 ? (
                    <Alert severity="info" variant="outlined">
                        No journal entries yet. Start logging your training sessions!
                    </Alert>
                ) : (
                    <List sx={{ p: 0 }}>
                        {entries.map((entry) => (
                            <Paper key={entry.id} variant="outlined" sx={{ mb: 2, p: { xs: 1.5, md: 3 }, borderRadius: 2 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mb: 1,
                                        cursor: 'pointer',
                                        '&:hover': {
                                            opacity: 0.85
                                        }
                                    }}>
                                    <Typography variant="h6">
                                        {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        {entry.time && ` • ${entry.time}`}
                                    </Typography>
                                    <Box
                                        sx={{ display: 'flex', alignItems: 'center' }}
                                        onClick={(e) => { e.stopPropagation(); }}
                                    >
                                        <IconButton size="small" onClick={() => { handleEditClick(entry); }} color="primary">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => { handleDeleteClick(entry.id); }} color="error">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => { toggleExpand(entry.id); }} sx={{ ml: 1 }}>
                                            {expandedEntries[entry.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 1,
                                        mb: 2
                                    }}>
                                    {entry.sessionType && (
                                        <Chip size="small" label={entry.sessionType} color="primary" variant="outlined" />
                                    )}
                                    {entry.length && (
                                        <Chip size="small" label={`${String(entry.length)} min`} variant="outlined" />
                                    )}
                                    {entry.maxPulse && (
                                        <Chip size="small" label={`Max Pulse: ${String(entry.maxPulse)}`} variant="outlined" color="secondary" />
                                    )}
                                </Box>

                                <Collapse in={expandedEntries[entry.id]}>
                                    {entry.exercises && entry.exercises.length > 0 ? (
                                        <Box sx={{
                                            mb: 2,
                                            mt: 1
                                        }}>
                                            {entry.exercises.map((se) => {
                                                const exercise = exercises.find(ex => ex.id === se.exerciseId);
                                                return (
                                                    <Box key={se.exerciseId} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                        <Typography variant="subtitle2" color="primary" sx={{
                                                            fontWeight: "bold"
                                                        }}>
                                                            {exercise?.name ?? 'Unknown Exercise'}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                                            {se.sets.map((set, idx) => (
                                                                <Typography key={set.id} variant="body2" sx={{ bgcolor: 'white', px: 1, py: 0.5, borderRadius: 0.5, border: '1px solid', borderColor: 'grey.300' }}>
                                                                    Set {idx + 1}: {set.weight}kg x {set.reps} {set.notes && `(${set.notes})`}
                                                                </Typography>
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    ) : (
                                        entry.exerciseIds.length > 0 && (
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: 1,
                                                    mb: 2,
                                                    mt: 1
                                                }}>
                                                {entry.exerciseIds.map((id: string) => (
                                                    <Chip key={id} label={getExerciseName(id)} size="small" variant="outlined" />
                                                ))}
                                            </Box>
                                        )
                                    )}
                                    {entry.comment && (
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mt: 1 }}>
                                            {entry.comment}
                                        </Typography>
                                    )}
                                </Collapse>
                            </Paper>
                        ))}
                    </List>
                )}
            </Box>
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); }}>
                <DialogTitle>Delete Journal Entry</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this training session? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setDeleteDialogOpen(false); }}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Journal;
