import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Typography, Box, Grid, CircularProgress, Alert, Container, ToggleButtonGroup, ToggleButton, Paper, List, ListItem, ListItemText, Chip, FormControl, InputLabel, Select, MenuItem, Accordion, AccordionSummary, AccordionDetails, TextField, InputAdornment, Skeleton, Button } from '@mui/material';
import { ViewModule, ViewList, ChevronRight, FilterList, ExpandMore, Search, Add } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { getUserProfile } from '../services/db';
import type { ExerciseType, UserProfile } from '../types';
import ExerciseCard from '../components/exercises/ExerciseCard';
import MarkerIcons from '../components/exercises/MarkerIcons';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';

const Exercises = () => {
    const { currentUser } = useAuth();
    const { exercises, loading: exercisesLoading, loadingMore, error: exercisesError, loadExercises, loadMore, hasMore } = useExercises();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState<ExerciseType | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Intersection Observer for Infinite Scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLElement | null) => {
        if (exercisesLoading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });
        
        if (node) observer.current.observe(node);
    }, [exercisesLoading, loadingMore, hasMore, loadMore]);

    const displayedExercises = useMemo(() => {
        return exercises.filter(exe => {
            // filter by type
            if (filter !== 'all' && exe.type !== filter) return false;
            
            // filter by search term
            if (searchTerm && !exe.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

            return true;
        });
    }, [exercises, filter, searchTerm]);

    useEffect(() => {
        loadExercises();
    }, [loadExercises]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!currentUser) return;
            try {
                const userProfile = await getUserProfile(currentUser.uid);
                setProfile(userProfile);
            } catch (err) {
                console.error(err);
            }
        };

        fetchProfile();
    }, [currentUser]);

    const loading = exercisesLoading && exercises.length === 0;
    const currentError = exercisesError;

    const handleViewChange = (
        _event: React.MouseEvent<HTMLElement>,
        newView: 'grid' | 'list' | null,
    ) => {
        if (newView !== null) {
            setViewMode(newView);
        }
    };

    const renderSkeletons = () => (
        <Grid container spacing={{ xs: 2, md: 3 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                </Grid>
            ))}
        </Grid>
    );

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Skeleton variant="text" width="40%" height={60} />
                    <Skeleton variant="rectangular" height={100} sx={{ mt: 2, borderRadius: 2 }} />
                </Box>
                {renderSkeletons()}
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" component="h1" fontWeight={700}>
                        Exercises
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {currentUser && (
                            <Button
                                component={RouterLink}
                                to="/exercises/new"
                                variant="contained"
                                color="primary"
                                startIcon={<Add />}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                            >
                                New
                            </Button>
                        )}
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={handleViewChange}
                            aria-label="view mode"
                            size="small"
                        >
                            <ToggleButton value="grid" aria-label="grid view">
                                <ViewModule />
                            </ToggleButton>
                            <ToggleButton value="list" aria-label="list view">
                                <ViewList />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Box>

                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                />

                <Accordion
                    elevation={0}
                    variant="outlined"
                    sx={{ borderRadius: 2, '&:before': { display: 'none' } }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls="filter-content"
                        id="filter-header"
                        sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FilterList color="action" />
                            <Typography fontWeight={600}>Filters</Typography>
                            {filter !== 'all' && (
                                <Chip label="Active" size="small" color="primary" sx={{ ml: 1, height: 20 }} />
                            )}
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: { xs: 1.5, sm: 2 } }}>
                        <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2 }, alignItems: 'center', flexWrap: 'wrap' }}>
                            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                                <InputLabel id="exercise-filter-label">Filter by Type</InputLabel>
                                <Select
                                    labelId="exercise-filter-label"
                                    id="exercise-filter"
                                    value={filter}
                                    label="Filter by Type"
                                    onChange={(e) => setFilter(e.target.value as ExerciseType | 'all')}
                                    sx={{ textTransform: 'capitalize' }}
                                >
                                    <MenuItem value="all">All Types</MenuItem>
                                    <MenuItem value="strength" sx={{ textTransform: 'capitalize' }}>Strength</MenuItem>
                                    <MenuItem value="cardio" sx={{ textTransform: 'capitalize' }}>Cardio</MenuItem>
                                    <MenuItem value="flexibility" sx={{ textTransform: 'capitalize' }}>Flexibility</MenuItem>
                                    <MenuItem value="other" sx={{ textTransform: 'capitalize' }}>Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </AccordionDetails>
                </Accordion>
            </Box>

            {currentError && <Alert severity="error" sx={{ mb: 4 }}>{currentError}</Alert>}

            {exercises.length === 0 && !currentError ? (
                <Alert severity="info" sx={{ mt: 4 }}>
                    No exercises found. Log in to add some exercises to the database.
                </Alert>
            ) : displayedExercises.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                    No exercises match the selected filter or search.
                </Alert>
            ) : viewMode === 'grid' ? (
                <Grid container spacing={{ xs: 2, md: 3 }}>
                    {displayedExercises.map((exercise, index) => (
                        <Grid 
                            size={{ xs: 12, sm: 6, md: 4 }} 
                            key={exercise.id}
                            ref={index === displayedExercises.length - 1 ? lastElementRef : null}
                        >
                            <ExerciseCard exercise={exercise} userProfile={profile} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                    <List disablePadding>
                        {displayedExercises.map((exercise, index) => (
                            <ListItem
                                key={exercise.id}
                                ref={index === displayedExercises.length - 1 ? lastElementRef : null}
                                divider={index < displayedExercises.length - 1}
                                component={RouterLink}
                                to={`/exercises/${exercise.id}`}
                                sx={{
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    '&:hover': { bgcolor: 'action.hover' },
                                    py: { xs: 1.5, md: 2 }
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                            <Typography variant="body1" fontWeight={600}>
                                                {exercise.name}
                                            </Typography>
                                            <Chip
                                                label={exercise.type}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                            {profile?.markedExercises?.[exercise.id] && (
                                                <Box sx={{ ml: 1 }}>
                                                    <MarkerIcons status={profile.markedExercises[exercise.id]} />
                                                </Box>
                                            )}
                                        </Box>
                                    }
                                />
                                <ChevronRight color="action" />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            {loadingMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress size={32} />
                </Box>
            )}

            {!hasMore && exercises.length > 0 && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ my: 4 }}>
                    You've reached the end of the list.
                </Typography>
            )}
        </Container>
    );
};

export default Exercises;
