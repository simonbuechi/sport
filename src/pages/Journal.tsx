import { useState, useMemo, useCallback, useRef } from 'react';
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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Collapse from '@mui/material/Collapse';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { useSessions } from '../context/SessionsContext';
import { deleteJournalEntry } from '../services/db';
import type { ActivityLog as JournalEntry, Exercise, SessionType } from '../types';


const Journal = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { exercises, loading: exercisesLoading } = useExercises();
    const { entries, loading: sessionsLoading } = useSessions();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
    const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});

    // Filter and Sort State
    const [typeFilter, setTypeFilter] = useState<SessionType | 'all'>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');

    // Infinite Scroll State
    const observer = useRef<IntersectionObserver | null>(null);
    const [displayCount, setDisplayCount] = useState(20);

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

    const confirmDelete = () => {
        if (!currentUser || !entryToDelete) return;

        try {
            void deleteJournalEntry(currentUser.uid, entryToDelete);
            // entries state is managed by SessionsContext and will update via onSnapshot
            setDeleteDialogOpen(false);
            setEntryToDelete(null);
        } catch (err) {
            console.error(err);
        }
    };

    // Filtered and Sorted entries
    const filteredAndSortedEntries = useMemo(() => {
        return entries
            .filter(entry => {
                // Type filter
                if (typeFilter !== 'all' && entry.sessionType !== typeFilter) return false;

                // Date filter
                if (startDate && entry.date < startDate) return false;
                if (endDate && entry.date > endDate) return false;

                return true;
            })
            .sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return sortBy === 'recent' ? dateB - dateA : dateA - dateB;
            });
    }, [entries, typeFilter, startDate, endDate, sortBy]);

    // Infinite Scroll Logic
    const lastElementRef = useCallback((node: HTMLElement | null) => {
        if (sessionsLoading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(obsEntries => {
            if (obsEntries[obsEntries.length - 1].isIntersecting && displayCount < filteredAndSortedEntries.length) {
                setDisplayCount(prev => prev + 20);
            }
        });

        if (node) observer.current.observe(node);
    }, [sessionsLoading, displayCount, filteredAndSortedEntries.length]);

    const displayedEntries = useMemo(() => {
        return filteredAndSortedEntries.slice(0, displayCount);
    }, [filteredAndSortedEntries, displayCount]);

    // Helper to get exercise name by ID
    const getExerciseName = (id: string) => {
        const t = exercises.find((tech: Exercise) => tech.id === id);
        return t ? t.name : 'Unknown Exercise';
    };

    const isLoading = (sessionsLoading && entries.length === 0) || (exercisesLoading && exercises.length === 0);

    if (isLoading) return (
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

            {/* Filter and Sort Bar */}
            <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 4, borderRadius: 2, bgcolor: 'background.default' }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    alignItems: { xs: 'stretch', md: 'flex-end' }
                }}>
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 150 } }}>
                        <InputLabel id="type-filter-label">Session Type</InputLabel>
                        <Select
                            labelId="type-filter-label"
                            id="type-filter"
                            value={typeFilter}
                            label="Session Type"
                            onChange={(e) => { setTypeFilter(e.target.value as SessionType | 'all'); }}
                            sx={{ textTransform: 'capitalize' }}
                        >
                            <MenuItem value="all">All Types</MenuItem>
                            <MenuItem value="strength" sx={{ textTransform: 'capitalize' }}>Strength</MenuItem>
                            <MenuItem value="cardio" sx={{ textTransform: 'capitalize' }}>Cardio</MenuItem>
                            <MenuItem value="flexibility" sx={{ textTransform: 'capitalize' }}>Flexibility</MenuItem>
                            <MenuItem value="other" sx={{ textTransform: 'capitalize' }}>Other</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="From"
                        type="date"
                        size="small"
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); }}
                        sx={{ minWidth: { xs: '100%', md: 150 } }}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />

                    <TextField
                        label="To"
                        type="date"
                        size="small"
                        value={endDate}
                        onChange={(e) => { setEndDate(e.target.value); }}
                        sx={{ minWidth: { xs: '100%', md: 150 } }}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />

                    <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 150 }, ml: { md: 'auto' } }}>
                        <InputLabel id="sort-by-label">Sort By</InputLabel>
                        <Select
                            labelId="sort-by-label"
                            id="sort-by"
                            value={sortBy}
                            label="Sort By"
                            onChange={(e) => { setSortBy(e.target.value); }}
                        >
                            <MenuItem value="recent">Most Recent</MenuItem>
                            <MenuItem value="oldest">Oldest</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* Journal Entries List */}
            <Box>

                {filteredAndSortedEntries.length === 0 ? (
                    <Alert severity="info" variant="outlined">
                        {entries.length === 0 
                            ? "No journal entries yet. Start logging your training sessions!" 
                            : "No sessions match your filters."}
                    </Alert>
                ) : (
                    <List sx={{ p: 0 }}>
                        {displayedEntries.map((entry, index) => (
                            <Paper 
                                key={entry.id} 
                                ref={index === displayedEntries.length - 1 ? lastElementRef : null}
                                variant="outlined" 
                                sx={{ mb: 2, p: { xs: 1.5, md: 3 }, borderRadius: 2 }}
                            >
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
                                        <Chip size="small" label={entry.sessionType} color="primary" variant="outlined" sx={{ textTransform: 'capitalize' }} />
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
                {displayCount < filteredAndSortedEntries.length && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress size={32} />
                    </Box>
                )}
                {displayCount >= filteredAndSortedEntries.length && filteredAndSortedEntries.length > 0 && (
                    <Typography
                        variant="body2"
                        align="center"
                        sx={{
                            color: "text.secondary",
                            my: 4
                        }}>
                        You&apos;ve reached the end of the journal.
                    </Typography>
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
