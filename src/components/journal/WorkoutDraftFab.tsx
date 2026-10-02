import { useCallback, useSyncExternalStore } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';
import runningAnim from '../../assets/animation-benchpress.png';
import Box from '@mui/material/Box';
import { useAuth } from '../../context/AuthContext';
import { getWorkoutDraftKey } from '../../hooks/useWorkoutForm';

interface DraftData {
    exercises?: unknown[];
    comment?: string;
}

const subscribeDraftUpdates = (callback: () => void) => {
    window.addEventListener('storage', callback);
    window.addEventListener('draft-updated', callback);
    return () => {
        window.removeEventListener('storage', callback);
        window.removeEventListener('draft-updated', callback);
    };
};

const WorkoutDraftFab = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();

    const getSnapshot = useCallback((): string | null => {
        if (!currentUser) return null;
        try {
            const userKey = getWorkoutDraftKey(currentUser.uid, 'new');
            let draftStr = localStorage.getItem(userKey);
            let activeKey = userKey;
            if (!draftStr) {
                draftStr = localStorage.getItem('workout_draft_new');
                activeKey = 'workout_draft_new';
            }
            if (draftStr) {
                const draft = JSON.parse(draftStr) as DraftData;
                const hasExercises = (draft.exercises?.length ?? 0) > 0;
                const hasComment = (draft.comment?.trim() ?? '') !== '';
                if (hasExercises || hasComment) return activeKey;
            }
        } catch (e) {
            console.error("Error parsing workout draft", e);
        }
        return null;
    }, [currentUser]);

    const draftKey = useSyncExternalStore(subscribeDraftUpdates, getSnapshot);

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
