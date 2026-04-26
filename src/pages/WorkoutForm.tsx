import { useParams, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';

import type { SessionType } from '../types';
import WorkoutExerciseItem from '../components/journal/WorkoutExerciseItem';
import PageLoader from '../components/common/PageLoader';
import { sortTemplates } from '../utils/workoutUtils';
import { useWorkoutForm } from '../hooks/useWorkoutForm';

const SESSION_TYPES: SessionType[] = ['strength', 'cardio', 'flexibility', 'other'];

const WorkoutForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const {
        date, setDate,
        time, setTime,
        length, setLength,
        sessionType, setSessionType,
        localComment, setLocalComment,
        maxPulse, setMaxPulse,
        sessionExercises,
        selectedTemplateId,
        autoFillFromLast, setAutoFillFromLast,
        autoSaveState,
        elapsedMinutes,
        error,
        loading, submitting,
        exercises, templates,
        exercisesLoading, profileLoading,
        isEditing, showTimer,
        handleAddExercise,
        handleRemoveExercise,
        handleAddSet,
        handleRemoveSet,
        handleUpdateSet,
        handleUpdateExerciseNote,
        handleTemplateChange,
        handleSubmit,
        previousExercisesMap,
        DRAFT_KEY
    } = useWorkoutForm(id);

    if (loading || (exercisesLoading && exercises.length === 0) || profileLoading) return (
        <PageLoader />
    );

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, md: 3 } }}>
                    <IconButton 
                        onClick={() => { void navigate(isEditing ? `/journal/${id ?? ''}` : '/journal'); }} 
                        sx={{ mr: 1, p: { xs: 0.5, sm: 1 } }}
                        aria-label="go back"
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" component="h1">
                        {isEditing ? 'Edit Workout' : 'New Workout'}
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {autoSaveState.error && <Alert severity="warning" sx={{ mb: 3, py: 0 }}>{autoSaveState.error}</Alert>}

                <Paper elevation={3} sx={{ p: { xs: 1.5, md: 4 }, position: 'relative' }}>
                    <form onSubmit={(e) => { void handleSubmit(e); }}>
                        <Grid container spacing={{ xs: 1.5, sm: 3 }}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    variant="standard"
                                    label="Date"
                                    type="date"
                                    fullWidth
                                    size="small"
                                    value={date}
                                    onChange={(e) => { setDate(e.target.value); }}
                                    required
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    variant="standard"
                                    label="Time"
                                    type="time"
                                    fullWidth
                                    size="small"
                                    value={time}
                                    onChange={(e) => { setTime(e.target.value); }}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    select
                                    variant="standard"
                                    label="Workout Type"
                                    fullWidth
                                    size="small"
                                    value={sessionType}
                                    onChange={(e) => { setSessionType(e.target.value as SessionType); }}
                                >
                                    {SESSION_TYPES.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 3 }}>
                                <TextField
                                    variant="standard"
                                    label="Length (min)"
                                    type="number"
                                    fullWidth
                                    size="small"
                                    value={length}
                                    onChange={(e) => { setLength(e.target.value === '' ? '' : Number(e.target.value)); }}
                                    slotProps={{ htmlInput: { min: 0 } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 3 }}>
                                <TextField
                                    variant="standard"
                                    label="Max Pulse"
                                    type="number"
                                    fullWidth
                                    size="small"
                                    value={maxPulse}
                                    onChange={(e) => { setMaxPulse(e.target.value === '' ? '' : Number(e.target.value)); }}
                                    slotProps={{ htmlInput: { min: 0 } }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    variant="standard"
                                    label="Notes"
                                    fullWidth
                                    size="small"
                                    value={localComment}
                                    onChange={(e) => { setLocalComment(e.target.value); }}
                                    placeholder="Quick notes..."
                                    slotProps={{ htmlInput: { maxLength: 1000 } }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>Exercises & Sets</Typography>
                                <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            select
                                            variant="filled"
                                            label="Use Template"
                                            fullWidth
                                            size="small"
                                            value={selectedTemplateId}
                                            onChange={(e) => { handleTemplateChange(e.target.value); }}
                                            helperText="Prepopulates workout"
                                        >
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {sortTemplates(templates).map((t) => (
                                                <MenuItem key={t.id} value={t.id}>
                                                    {t.isFavorite && '★ '}{t.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Tooltip title="Automatically fill in weight and reps from your last training" arrow>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={autoFillFromLast}
                                                        onChange={(e) => { setAutoFillFromLast(e.target.checked); }}
                                                        color="primary"
                                                    />
                                                }
                                                label="Auto-fill"
                                                sx={{ ml: 1 }}
                                            />
                                        </Tooltip>
                                    </Grid>
                                </Grid>

                                {sessionExercises.map((se) => {
                                    const exercise = exercises.find(ex => ex.id === se.exerciseId);
                                    return (
                                        <WorkoutExerciseItem
                                            key={se.exerciseId}
                                            sessionExercise={se}
                                            exercise={exercise}
                                            onRemoveExercise={handleRemoveExercise}
                                            onAddSet={handleAddSet}
                                            onUpdateSet={handleUpdateSet}
                                            onRemoveSet={handleRemoveSet}
                                            onUpdateExerciseNote={handleUpdateExerciseNote}
                                            previousExercise={previousExercisesMap[se.exerciseId]}
                                        />
                                    );
                                })}

                                <Box sx={{ mt: 2 }}>
                                    <Autocomplete
                                        key={sessionExercises.length}
                                        size="small"
                                        options={exercises.filter(ex => !sessionExercises.find(se => se.exerciseId === ex.id))}
                                        getOptionLabel={(option) => option.name}
                                        onChange={(_, newValue) => { handleAddExercise(newValue); }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="filled"
                                                label="Add Exercise"
                                                placeholder="Search exercises..."
                                            />
                                        )}
                                        value={null}
                                        sx={{ width: '100%', maxWidth: { sm: 400 } }}
                                    />
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: "flex-end", alignItems: 'center', gap: 3 }}>
                                    {!isEditing && showTimer && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AccessTimeIcon fontSize="small" color="action" />
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                {elapsedMinutes} min
                                            </Typography>
                                        </Box>
                                    )}
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button variant="outlined" onClick={() => {
                                            localStorage.removeItem(DRAFT_KEY);
                                            void navigate(isEditing ? `/journal/${id ?? ''}` : '/journal');
                                        }}>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            disabled={submitting}
                                            sx={{ minWidth: 150 }}
                                        >
                                            {submitting ? 'Saving...' : (isEditing ? 'Update Workout' : 'Finish Workout')}
                                        </Button>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default WorkoutForm;
