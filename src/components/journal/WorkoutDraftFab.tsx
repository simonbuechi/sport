import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';
import runningAnim from '../../assets/animation-benchpress.png';
import Box from '@mui/material/Box';

interface DraftData {
    exercises?: unknown[];
    comment?: string;
}

const WorkoutDraftFab = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [draftKey, setDraftKey] = useState<string | null>(() => {
        try {
            const draftStr = localStorage.getItem('workout_draft_new');
            if (draftStr) {
                const draft = JSON.parse(draftStr) as DraftData;
                const hasExercises = (draft.exercises?.length ?? 0) > 0;
                const hasComment = (draft.comment?.trim() ?? '') !== '';
                if (hasExercises || hasComment) return 'workout_draft_new';
            }
        } catch (e) {
            console.error("Error parsing workout draft", e);
        }
        return null;
    });

    const checkDrafts = useCallback(() => {
        try {
            const draftStr = localStorage.getItem('workout_draft_new');
            if (draftStr) {
                const draft = JSON.parse(draftStr) as DraftData;
                const hasExercises = (draft.exercises?.length ?? 0) > 0;
                const hasComment = (draft.comment?.trim() ?? '') !== '';

                if (hasExercises || hasComment) {
                    setDraftKey('workout_draft_new');
                    return;
                }
            }
        } catch (e) {
            console.error("Error parsing workout draft", e);
        }
        setDraftKey(null);
    }, []);

    useEffect(() => {
        // Polling as a fallback for window-local changes
        const interval = setInterval(checkDrafts, 3000);

        // Listen for storage events (if changed in other tabs)
        window.addEventListener('storage', checkDrafts);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', checkDrafts);
        };
    }, [checkDrafts]);

    // Don't show if we are on the workout form already
    const isWorkoutForm = location.pathname === '/journal/new' ||
        (location.pathname.startsWith('/journal/') && location.pathname.endsWith('/edit'));

    if (!draftKey || isWorkoutForm) return null;

    const handleClick = () => {
        void navigate('/journal/new');
    };

    return (
        <Tooltip title="Go back to your workout" placement="left" arrow>
            <Fab
                color="primary"
                aria-label="go back to workout"
                onClick={handleClick}
                sx={{
                    position: 'fixed',
                    bottom: { xs: 80, md: 24 },
                    right: { xs: 16, md: 24 },
                    width: { xs: 48, md: 56 },
                    height: { xs: 48, md: 56 },
                    zIndex: 1100,
                    background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    transition: 'all 0.3s ease-in-out',
                    padding: 0,
                    overflow: 'hidden',
                    '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: 6,
                    },
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%'
                    }}
                >
                    <Box
                        component="img"
                        src={runningAnim}
                        alt="Running"
                        sx={{
                            width: '70%',
                            height: '70%',
                            objectFit: 'contain',
                            filter: 'invert(1)'
                        }}
                    />
                </Box>
            </Fab>
        </Tooltip>
    );
};

export default WorkoutDraftFab;
