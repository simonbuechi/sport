import { useState, useEffect } from 'react';
import { Typography, Box, Grid, CircularProgress, Alert, Container, ToggleButtonGroup, ToggleButton, Paper, List, ListItem, ListItemText, Chip, FormControl, InputLabel, Select, MenuItem, Tooltip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ViewModule, ViewList, ChevronRight, FilterList, ExpandMore, PlayCircleOutline, Link as LinkIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { getUserProfile } from '../services/db';
import type { ExerciseType, UserProfile } from '../types';
import ExerciseCard from '../components/exercises/ExerciseCard';
import MarkerIcons from '../components/exercises/MarkerIcons';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';

const Exercises = () => {
    const { currentUser } = useAuth();
    const { exercises, loading: exercisesLoading, error: exercisesError, loadExercises } = useExercises();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [error] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState<ExerciseType | 'all'>('all');
    const [markerFilter, setMarkerFilter] = useState<'all' | 'favorite' | 'learning' | 'toLearn'>('all');
    const [skillFilter, setSkillFilter] = useState<number | 'all'>('all');

    const displayedExercises = exercises.filter(exe => {
        // filter by type
        if (filter !== 'all' && exe.type !== filter) return false;

        // filter by marker (only if a profile is present and specifically filtering)
        if (currentUser && profile && markerFilter !== 'all') {
            const exeStatus = profile.markedExercises?.[exe.id];
            if (!exeStatus || !exeStatus[markerFilter]) return false;
        }

        // filter by skill level
        if (currentUser && profile && skillFilter !== 'all') {
            const exeStatus = profile.markedExercises?.[exe.id];
            if (!exeStatus || exeStatus.skillLevel !== skillFilter) return false;
        }

        return true;
    });

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
                // Profile error isn't fatal to seeing the list
            }
        };

        fetchProfile();
    }, [currentUser]);

    const loading = exercisesLoading && exercises.length === 0;
    const currentError = error || exercisesError;



    const handleViewChange = (
        _event: React.MouseEvent<HTMLElement>,
        newView: 'grid' | 'list' | null,
    ) => {
        if (newView !== null) {
            setViewMode(newView);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            {exercises.length > 0 && (
                <Box sx={{ mb: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 } }}>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" component="h1">
                            Exercises
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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

                    <Accordion
                        elevation={0}
                        variant="outlined"
                        defaultExpanded={typeof window !== 'undefined' && window.innerWidth > 900}
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

                                {(filter !== 'all' || markerFilter !== 'all' || skillFilter !== 'all') && (
                                    <Chip label="Active" size="small" color="primary" sx={{ ml: 1, height: 20 }} />
                                )}
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: { xs: 1.5, sm: 2 } }}>
                            <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2 }, alignItems: 'center', flexWrap: 'wrap' }}>
                                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 }, flex: { xs: '1 1 100%', sm: '1 1 auto' } }}>
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
                                        <MenuItem value="mobility" sx={{ textTransform: 'capitalize' }}>Mobility</MenuItem>
                                        <MenuItem value="other" sx={{ textTransform: 'capitalize' }}>Other</MenuItem>
                                    </Select>
                                </FormControl>

                                {currentUser && (
                                    <>
                                        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 }, flex: { xs: '1 1 100%', sm: '1 1 auto' } }}>
                                            <InputLabel id="marker-filter-label">Marker</InputLabel>
                                            <Select
                                                labelId="marker-filter-label"
                                                id="marker-filter"
                                                value={markerFilter}
                                                label="Marker"
                                                onChange={(e) => setMarkerFilter(e.target.value as 'all' | 'favorite' | 'learning' | 'toLearn')}
                                                sx={{ textTransform: 'capitalize' }}
                                            >
                                                <MenuItem value="all">All Markers</MenuItem>
                                                <MenuItem value="favorite" sx={{ textTransform: 'capitalize' }}>Favorite</MenuItem>
                                                <MenuItem value="learning" sx={{ textTransform: 'capitalize' }}>Learning</MenuItem>
                                                <MenuItem value="toLearn" sx={{ textTransform: 'capitalize' }}>To Learn</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 }, flex: { xs: '1 1 100%', sm: '1 1 auto' } }}>
                                            <InputLabel id="skill-filter-label">Skill Level</InputLabel>
                                            <Select
                                                labelId="skill-filter-label"
                                                id="skill-filter"
                                                value={skillFilter}
                                                label="Skill Level"
                                                onChange={(e) => setSkillFilter(e.target.value as number | 'all')}
                                            >
                                                <MenuItem value="all">All levels</MenuItem>
                                                <MenuItem value={1}>1 Star</MenuItem>
                                                <MenuItem value={2}>2 Stars</MenuItem>
                                                <MenuItem value={3}>3 Stars</MenuItem>
                                                <MenuItem value={4}>4 Stars</MenuItem>
                                                <MenuItem value={5}>5 Stars</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </>
                                )}
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            )}

            {currentError && <Alert severity="error" sx={{ mb: 4 }}>{currentError}</Alert>}

            {exercises.length === 0 && !currentError ? (
                <Alert severity="info" sx={{ mt: 4 }}>
                    No exercises found. Log in to add some exercises to the database.
                </Alert>
            ) : displayedExercises.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                    No exercises match the selected filter.
                </Alert>
            ) : viewMode === 'grid' ? (
                <Grid container spacing={{ xs: 2, md: 3 }}>
                    {displayedExercises.map((exercise) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={exercise.id}>
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
                                            {exercise.videos && exercise.videos.length > 0 && (
                                                <Tooltip title="Has Video">
                                                    <PlayCircleOutline color="primary" fontSize="small" />
                                                </Tooltip>
                                            )}
                                            {exercise.resources && exercise.resources.length > 0 && (
                                                <Tooltip title="Has External Link">
                                                    <LinkIcon color="primary" fontSize="small" />
                                                </Tooltip>
                                            )}
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


        </Container>
    );
};

export default Exercises;
