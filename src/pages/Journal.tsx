import { useState, useMemo, useCallback, useRef } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import Grid from '@mui/material/Grid';
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
import { deleteWorkout, createWorkout } from '../services/db';
import type { Workout, Exercise, WorkoutType } from '../types';
import WorkoutItem from '../components/journal/WorkoutItem';
import PageLoader from '../components/common/PageLoader';

const SESSION_TYPES: WorkoutType[] = ['strength', 'cardio', 'flexibility', 'other'];


const Journal = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { exercises, loading: exercisesLoading } = useExercises();
    const { entries, templates, loading: sessionsLoading } = useWorkouts();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

    // Filter and Sort State
    const [typeFilter, setTypeFilter] = useState<WorkoutType | 'all'>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');

    // Infinite Scroll State
    const observer = useRef<IntersectionObserver | null>(null);
    const [displayCount, setDisplayCount] = useState(5);

    // Add Workout Dialog State
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newWorkoutData, setNewWorkoutData] = useState({
        date: new Date().toISOString().split('T')[0],
        time: `${new Date().getHours().toString().padStart(2, '0')}:00`,
        sessionType: 'strength' as WorkoutType,
        templateId: ''
    });

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

    const handleAddWorkout = async () => {
        if (!currentUser) return;

        try {
            setSubmitting(true);
            const template = templates.find(t => t.id === newWorkoutData.templateId);
            const workoutData: Omit<Workout, 'id' | 'userId'> = {
                date: newWorkoutData.date,
                time: newWorkoutData.time,
                sessionType: newWorkoutData.sessionType,
                comment: template ? `Template: ${template.name}` : '',
                exerciseIds: template ? template.exercises.map(e => e.exerciseId) : [],
                exercises: template ? template.exercises.map(te => ({
                    exerciseId: te.exerciseId,
                    note: te.note,
                    sets: te.sets?.map(s => ({
                        id: Math.random().toString(36).slice(2, 11),
                        weight: s.weight ?? 0,
                        reps: s.reps ?? 0,
                        notes: s.notes ?? ''
                    })) ?? [{ id: Math.random().toString(36).slice(2, 11), weight: 0, reps: 0 }]
                })) : []
            };

            const newId = await createWorkout(currentUser.uid, workoutData);
            setAddDialogOpen(false);
            void navigate(`/journal/${newId}/edit`);
        } catch (err) {
            console.error('Error creating workout:', err);
        } finally {
            setSubmitting(false);
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
                setDisplayCount(prev => prev + 5);
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
        <PageLoader />
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
                        onClick={() => {
                            setNewWorkoutData({
                                date: new Date().toISOString().split('T')[0],
                                time: `${new Date().getHours().toString().padStart(2, '0')}:00`,
                                sessionType: 'strength' as WorkoutType,
                                templateId: ''
                            });
                            setAddDialogOpen(true);
                        }}
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
                    mb: 3,
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
                            <InputLabel id="type-filter-label">Workout Type</InputLabel>
                            <Select
                                labelId="type-filter-label"
                                id="type-filter"
                                value={typeFilter}
                                label="Workout Type"
                                onChange={(e) => { setTypeFilter(e.target.value as WorkoutType | 'all'); }}
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

            {/* Add Workout Dialog */}
            <Dialog open={addDialogOpen} onClose={() => { if (!submitting) setAddDialogOpen(false); }} maxWidth="xs" fullWidth>
                <DialogTitle>Add Workout</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label="Date"
                                type="date"
                                fullWidth
                                size="small"
                                value={newWorkoutData.date}
                                onChange={(e) => { setNewWorkoutData(prev => ({ ...prev, date: e.target.value })); }}
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label="Time"
                                type="time"
                                fullWidth
                                size="small"
                                value={newWorkoutData.time}
                                onChange={(e) => { setNewWorkoutData(prev => ({ ...prev, time: e.target.value })); }}
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Workout Type</InputLabel>
                                <Select
                                    value={newWorkoutData.sessionType}
                                    label="Workout Type"
                                    onChange={(e) => { setNewWorkoutData(prev => ({ ...prev, sessionType: e.target.value as WorkoutType })); }}
                                >
                                    {SESSION_TYPES.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Template</InputLabel>
                                <Select
                                    value={newWorkoutData.templateId}
                                    label="Template"
                                    onChange={(e) => { setNewWorkoutData(prev => ({ ...prev, templateId: e.target.value })); }}
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {templates.sort((a, b) => {
                                        if (a.isFavorite && !b.isFavorite) return -1;
                                        if (!a.isFavorite && b.isFavorite) return 1;
                                        return a.name.localeCompare(b.name);
                                    }).map((t) => (
                                        <MenuItem key={t.id} value={t.id}>
                                            {t.isFavorite && '★ '}{t.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => { setAddDialogOpen(false); }} disabled={submitting}>Cancel</Button>
                    <Button
                        onClick={handleAddWorkout}
                        variant="contained"
                        color="primary"
                        disabled={submitting}
                        sx={{ minWidth: 120 }}
                    >
                        {submitting ? <CircularProgress size={24} /> : 'Add Workout'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Journal;
