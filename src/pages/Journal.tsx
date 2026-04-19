import { useState, useMemo, useCallback, useRef } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
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
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { useSessions } from '../context/SessionsContext';
import { deleteJournalEntry } from '../services/db';
import type { ActivityLog as JournalEntry, Exercise, SessionType } from '../types';
import JournalEntryItem from '../components/journal/JournalEntryItem';


const Journal = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { exercises, loading: exercisesLoading } = useExercises();
    const { entries, loading: sessionsLoading } = useSessions();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

    // Filter and Sort State
    const [typeFilter, setTypeFilter] = useState<SessionType | 'all'>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');

    // Infinite Scroll State
    const observer = useRef<IntersectionObserver | null>(null);
    const [displayCount, setDisplayCount] = useState(20);

    const handleEditClick = useCallback((entry: JournalEntry) => {
        void navigate(`/journal/${entry.id}/edit`);
    }, [navigate]);

    const handleDeleteClick = useCallback((id: string) => {
        setEntryToDelete(id);
        setDeleteDialogOpen(true);
    }, []);

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

    const exerciseMap = useMemo(() => {
        return exercises.reduce<Record<string, Exercise | undefined>>((acc, ex) => {
            acc[ex.id] = ex;
            return acc;
        }, {});
    }, [exercises]);

    const isLoading = (sessionsLoading && entries.length === 0) || (exercisesLoading && exercises.length === 0);

    if (isLoading) return (
        <Stack sx={{ mt: 8 }}>
            <CircularProgress />
        </Stack>
    );

    return (
        <Container maxWidth="lg">
            <Stack sx={{ justifyContent: "space-between", mt: { xs: 1, md: 2 }, mb: { xs: 2, md: 4 } }}>
                <Typography variant="h4" component="h1">
                    Journal
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<DescriptionIcon />}
                        onClick={() => navigate('/journal/templates')}
                    >
                        Templates
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/journal/new')}
                    >
                        Workout
                    </Button>
                </Stack>
            </Stack>
            <Divider sx={{ mb: { xs: 2, md: 4 } }} />

            {/* Filter and Sort Bar */}
            <Paper variant="section" elevation={0} sx={{ bgcolor: 'background.default' }}>
                <Stack sx={{ alignItems: { xs: 'stretch', md: 'flex-end' } }} direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
                </Stack>
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
                            <JournalEntryItem
                                key={entry.id}
                                ref={index === displayedEntries.length - 1 ? lastElementRef : null}
                                entry={entry}
                                exerciseMap={exerciseMap}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </List>
                )}
                {displayCount < filteredAndSortedEntries.length && (
                    <Stack sx={{ my: 4 }}>
                        <CircularProgress size={32} />
                    </Stack>
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
