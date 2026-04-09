import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Typography, Box, Container, Paper, TextField,
    Button, CircularProgress, Alert, Grid, MenuItem, Chip
} from '@mui/material';
import { getExerciseById, createExercise, updateExercise } from '../services/db';
import type { Exercise, ExerciseType, BodyPart, ExerciseCategory } from '../types';
import { useExercises } from '../context/ExercisesContext';

const EXERCISE_TYPES: ExerciseType[] = ['strength', 'cardio', 'flexibility', 'other'];
const BODY_PARTS: BodyPart[] = ['Whole Body', 'Legs', 'Back', 'Shoulders', 'Chest', 'Biceps', 'Triceps', 'Core', 'Forearms'];
const CATEGORIES: ExerciseCategory[] = ['Bodyweight', 'Barbell', 'Dumbbell', 'Machine', 'Cable', 'Kettlebell'];


export default function ExerciseForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { loadExercises, refreshExercises } = useExercises();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState<Omit<Exercise, 'id'>>({
        name: '',
        name_url: '',
        type: 'strength',
        bodypart: 'Whole Body',
        category: 'Bodyweight',
        description: '',
        icon_url: '',
        aliases: []
    });

    const [aliasInput, setAliasInput] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Ensure techniques are loaded in context
                loadExercises();

                if (isEditing && id) {
                    const tech = await getExerciseById(id);
                    if (tech) {
                        setFormData({
                            name: tech.name,
                            name_url: tech.name_url || '',
                            type: tech.type,
                            bodypart: tech.bodypart || 'Whole Body',
                            category: tech.category || 'Bodyweight',
                            description: tech.description || '',
                            icon_url: tech.icon_url || '',
                            aliases: tech.aliases || []
                        });
                    } else {
                        setError('Exercise not found');
                    }
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id, isEditing, loadExercises]);

    const handleChange = (field: keyof Omit<Exercise, 'id'>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleAddAlias = () => {
        const trimmed = aliasInput.trim();
        if (!trimmed) return;
        if (formData.aliases.includes(trimmed)) {
            setAliasInput('');
            return;
        }
        setFormData({
            ...formData,
            aliases: [...formData.aliases, trimmed]
        });
        setAliasInput('');
    };

    const handleRemoveAlias = (indexToRemove: number) => {
        setFormData({
            ...formData,
            aliases: formData.aliases.filter((_, index) => index !== indexToRemove)
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setError('');

            const finalData = {
                ...formData,
            };

            // Save to firestore
            if (isEditing && id) {
                await updateExercise(id, finalData);
                await refreshExercises();
                navigate(`/exercises/${id}`);
            } else {
                const newId = await createExercise(finalData);
                await refreshExercises();
                navigate(`/exercises/${newId}`);
            }
        } catch (err) {
            console.error(err);
            setError(`Failed to ${isEditing ? 'update' : 'create'} exercise`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                mt: 8
            }}><CircularProgress /></Box>
    );

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 4, borderRadius: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {isEditing ? 'Edit Exercise' : 'Add New Exercise'}
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 12 }}>
                            <TextField
                                label="Exercise Name"
                                fullWidth
                                required
                                value={formData.name}
                                onChange={handleChange('name')}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Name URL"
                                fullWidth
                                value={formData.name_url}
                                onChange={handleChange('name_url')}
                                placeholder="bench-press"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Icon URL"
                                fullWidth
                                value={formData.icon_url}
                                onChange={handleChange('icon_url')}
                                placeholder="bench-press.png"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                select
                                label="Type"
                                fullWidth
                                required
                                value={formData.type}
                                onChange={handleChange('type')}
                                sx={{ textTransform: 'capitalize' }}
                            >
                                {EXERCISE_TYPES.map((type) => (
                                    <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                select
                                label="Body Part"
                                fullWidth
                                required
                                value={formData.bodypart}
                                onChange={handleChange('bodypart')}
                            >
                                {BODY_PARTS.map((bp) => (
                                    <MenuItem key={bp} value={ bp}>
                                        {bp}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                select
                                label="Category"
                                fullWidth
                                required
                                value={formData.category}
                                onChange={handleChange('category')}
                            >
                                {CATEGORIES.map((cat) => (
                                    <MenuItem key={cat} value={cat}>
                                        {cat}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Description"
                                multiline
                                rows={4}
                                fullWidth
                                value={formData.description}
                                onChange={handleChange('description')}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" gutterBottom>Aliases</Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    mb: 1
                                }}>
                                <TextField
                                    label="Add Alias"
                                    fullWidth
                                    size="small"
                                    value={aliasInput}
                                    onChange={(e) => setAliasInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddAlias();
                                        }
                                    }}
                                />
                                <Button variant="outlined" onClick={handleAddAlias}>Add</Button>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 1
                                }}>
                                {formData.aliases.map((alias, index) => (
                                    <Chip 
                                        key={index} 
                                        label={alias} 
                                        onDelete={() => handleRemoveAlias(index)}
                                        size="small"
                                    />
                                ))}
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: 2,
                                    mt: 2
                                }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate(isEditing ? `/exercises/${id}` : '/exercises')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Saving...' : 'Save Exercise'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
}
