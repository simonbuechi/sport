import { useState, useEffect, useRef, memo } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import EditNote from '@mui/icons-material/EditNote';
import { useUserProfile } from '../../hooks/useUserProfile';
import { updateExerciseStatus } from '../../utils/exerciseUtils';
import { useAuth } from '../../context/AuthContext';

interface ExerciseNotesProps {
    exerciseId: string;
}

const ExerciseNotes = ({ exerciseId }: ExerciseNotesProps) => {
    const { currentUser } = useAuth();
    const { profile, updateProfile } = useUserProfile();
    const [notes, setNotes] = useState(() => profile?.markedExercises?.[exerciseId]?.notes ?? '');
    const lastSavedNotes = useRef<string>(notes);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [prevData, setPrevData] = useState({ exerciseId, profileId: profile?.uid });

    // Sync notes when exercise or profile changes
    if (exerciseId !== prevData.exerciseId || profile?.uid !== prevData.profileId) {
        const currentNotes = profile?.markedExercises?.[exerciseId]?.notes ?? '';
        setNotes(currentNotes);
        setPrevData({ exerciseId, profileId: profile?.uid });
    }

    useEffect(() => {
        lastSavedNotes.current = notes;
    }, [prevData, notes]);

    const handleSave = async (content: string) => {
        if (!currentUser || !profile || content === lastSavedNotes.current) return;

        try {
            const updatedMarked = updateExerciseStatus(profile, exerciseId, { notes: content });
            await updateProfile({ markedExercises: updatedMarked });
            lastSavedNotes.current = content;
        } catch (err) {
            console.error("Failed to save notes", err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setNotes(newValue);

        // Clear existing timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer for auto-save
        debounceTimer.current = setTimeout(() => {
            void handleSave(newValue);
        }, 3000);
    };

    const handleBlur = () => {
        // Save immediately on blur if there are pending changes
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        void handleSave(notes);
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    return (
        <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 3 } }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1
                }}>
                <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                    <Grid>
                        <EditNote color="primary" />
                    </Grid>
                    <Grid>
                        <Typography variant="h6">My Notes</Typography>
                    </Grid>
                </Grid>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TextField
                id="exercise-personal-notes"
                aria-label="My Notes"
                multiline
                rows={6}
                fullWidth
                placeholder="Add your personal notes and details about this exercise..."
                value={notes}
                onChange={handleChange}
                onBlur={handleBlur}
                variant="outlined"
                size="small"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.default',
                    }
                }}
            />
            <Typography
                variant="caption"
                sx={{
                    color: "text.secondary",
                    mt: 1,
                    display: 'block'
                }}>
                Notes are private to you and save automatically.
            </Typography>
        </Paper>
    );
};

export default memo(ExerciseNotes);
