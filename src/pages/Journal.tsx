import { useState, useMemo, useCallback, useRef } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
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
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { useWorkouts } from '../context/WorkoutsContext';
import { deleteWorkout } from '../services/db';
import type { Workout, Exercise, SessionType } from '../types';
import WorkoutItem from '../components/journal/WorkoutItem';
import Skeleton from '@mui/material/Skeleton';



const Journal = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { exercises, loading: exercisesLoading } = useExercises();
    const { entries, loading: sessionsLoading, loadMore, hasMore } = useWorkouts();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

    // Filter and Sort State
    const [typeFilter, setTypeFilter] = useState<SessionType | 'all'>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');

    // Infinite Scroll State
    const observer = useRef<IntersectionObserver | null>(null);


    const handleEditClick = useCallback((entry: Workout) => {
        void navigate(`/journal/${entry.id}/edit`);
    }, [navigate]);

    const handleDeleteClick = useCallback((id: string) => {
        setEntryToDelete(id);
        setDeleteDialogOpen(true);
    }, []);

    const confirmDelete = () => {
        if (!currentUser || !entryToDelete) return;

        try {
            void deleteWorkout(currentUser.uid, entryToDelete);
            // entries state is managed by WorkoutsContext and will update via onSnapshot
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
            if (obsEntries[obsEntries.length - 1].isIntersecting && hasMore) {
                loadMore();
            }
        });
 
        if (node) observer.current.observe(node);
    }, [sessionsLoading, hasMore, loadMore]);

    const displayedEntries = filteredAndSortedEntries;

    const exerciseMap = useMemo(() => {
        return exercises.reduce<Record<string, Exercise | undefined>>((acc, ex) => {
            acc[ex.id] = ex;
            return acc;
        }, {});
    }, [exercises]);

    const isLoading = (sessionsLoading && entries.length === 0) || (exercisesLoading && exercises.length === 0);

    if (isLoading) return (
        <Container maxWidth="lg">
            <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={{ xs: 1, sm: 2 }} 
                sx={{ 
                    justifyContent: "space-between", 
                    alignItems: { xs: 'stretch', sm: 'center' },
                    mt: { xs: 0.5, md: 2 }, 
                    mb: { xs: 1.5, md: 4 } 
                }}
            >
                <Skeleton variant="text" width={150} height={60} />
                <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'space-between', sm: 'flex-end' }, alignItems: 'center' }}>
                    <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
                </Stack>
            </Stack>
            <Skeleton variant="rectangular" height={56} sx={{ mb: { xs: 2, md: 3 }, borderRadius: 2 }} />
            <Stack spacing={2}>
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                ))}
            </Stack>
        </Container>
    );

    return (
        <Container maxWidth="lg">
            <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={{ xs: 1, sm: 2 }} 
                sx={{ 
                    justifyContent: "space-between", 
                    alignItems: { xs: 'stretch', sm: 'center' },
                    mt: { xs: 0.5, md: 2 }, 
                    mb: { xs: 1.5, md: 4 } 
                }}
            >
                <Typography variant="h4" component="h1">
                    Journal
                </Typography>
                <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'space-between', sm: 'flex-end' }, alignItems: 'center' }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<DescriptionIcon />}
                        onClick={() => navigate('/journal/templates')}
                        sx={{ flex: { xs: 1, sm: '0 0 auto' } }}
                    >
                        Templates
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/journal/new')}
                        sx={{ flex: { xs: 1, sm: '0 0 auto' } }}
                    >
                        Workout
                    </Button>
                </Stack>
            </Stack>

            {/* Filter and Sort Bar */}
            <Accordion
                elevation={0}
                sx={{
                    bgcolor: 'background.default',
                    mb: { xs: 2, md: 3 },
                    '&:before': { display: 'none' },
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '8px !important'
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ px: 2 }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FilterListIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Filters & Sorting</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 2, px: 2 }}>
                    <Stack sx={{ alignItems: { xs: 'stretch', md: 'flex-end' } }} direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 150 } }}>
                            <InputLabel id="type-filter-label" htmlFor="type-filter-input">Workout Type</InputLabel>
                            <Select
                                labelId="type-filter-label"
                                id="type-filter"
                                inputProps={{ id: 'type-filter-input' }}
                                value={typeFilter}
                                label="Workout Type"
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
                            id="journal-date-from"
                            label="From"
                            type="date"
                            size="small"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); }}
                            sx={{ minWidth: { xs: '100%', md: 150 } }}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />

                        <TextField
                            id="journal-date-to"
                            label="To"
                            type="date"
                            size="small"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); }}
                            sx={{ minWidth: { xs: '100%', md: 150 } }}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />

                        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 150 }, ml: { md: 'auto' } }}>
                            <InputLabel id="sort-by-label" htmlFor="sort-by-input">Sort By</InputLabel>
                            <Select
                                labelId="sort-by-label"
                                id="sort-by"
                                inputProps={{ id: 'sort-by-input' }}
                                value={sortBy}
                                label="Sort By"
                                onChange={(e) => { setSortBy(e.target.value); }}
                            >
                                <MenuItem value="recent">Most Recent</MenuItem>
                                <MenuItem value="oldest">Oldest</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </AccordionDetails>
            </Accordion>

            {/* Workouts List */}
            <Box>

                {filteredAndSortedEntries.length === 0 ? (
                    <Alert severity="info" variant="outlined">
                        {entries.length === 0
                            ? "No workouts yet. Start logging your training workouts!"
                            : "No workouts match your filters."}
                    </Alert>
                ) : (
                    <List sx={{ p: 0 }}>
                        {displayedEntries.map((entry, index) => (
                            <WorkoutItem
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
                {hasMore && (
                    <Stack sx={{ my: 4, alignItems: 'center' }}>
                        <CircularProgress size={32} />
                    </Stack>
                )}
                {!hasMore && filteredAndSortedEntries.length > 0 && (
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
                <DialogTitle>Delete Workout</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this training workout? This action cannot be undone.
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
