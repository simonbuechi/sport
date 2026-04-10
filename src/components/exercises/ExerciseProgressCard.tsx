import { Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Rating from '@mui/material/Rating';

import Favorite from '@mui/icons-material/Favorite';
import MenuBook from '@mui/icons-material/MenuBook';
import School from '@mui/icons-material/School';
import Flag from '@mui/icons-material/Flag';

import type { MarkedStatus } from '../../types';

interface ExerciseProgressCardProps {
    currentUser: any;
    currentStatus: MarkedStatus;
    onToggleStatus: (key: keyof Omit<MarkedStatus, 'skillLevel'>) => void;
    onRatingChange: (event: React.SyntheticEvent, newValue: number | null) => void;
}

const ExerciseProgressCard = ({ currentUser, currentStatus, onToggleStatus, onRatingChange }: ExerciseProgressCardProps) => {
    return (
        <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>My Progress</Typography>
            <Divider sx={{ mb: 3 }} />

            {!currentUser ? (
                <Box>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "text.secondary",
                            mb: 2
                        }}>
                        Log in to mark this exercise and track your progress.
                    </Typography>
                    <Button variant="outlined" fullWidth component={RouterLink} to="/login">
                        Log In
                    </Button>
                </Box>
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2
                    }}>
                    <ToggleButtonGroup
                        orientation="vertical"
                        fullWidth
                        sx={{
                            '& .MuiToggleButton-root': {
                                display: 'flex',
                                justifyContent: 'flex-start',
                                px: 2,
                                py: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.2s',
                                textTransform: 'none',
                                borderRadius: 0,
                                mb: 0,
                                '&:first-of-type': {
                                    borderTopLeftRadius: '12px',
                                    borderTopRightRadius: '12px',
                                },
                                '&:last-of-type': {
                                    borderBottomLeftRadius: '12px',
                                    borderBottomRightRadius: '12px',
                                }
                            }
                        }}
                    >
                        <ToggleButton
                            value="favorite"
                            selected={!!currentStatus.favorite}
                            onChange={() => { onToggleStatus('favorite'); }}
                            size="small"
                            sx={{
                                '&.Mui-selected': {
                                    bgcolor: '#D7195F',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    borderColor: '#D7195F',
                                    '&:hover': { bgcolor: '#D7195F' },
                                    '& .MuiSvgIcon-root': { color: 'white' }
                                }
                            }}
                        >
                            <Favorite sx={{ mr: 1, fontSize: 22 }} />
                            <Typography variant="body2" sx={{ fontWeight: 'inherit', textAlign: 'left' }}>Favorite</Typography>
                            {currentStatus.favorite && <Flag sx={{ ml: 'auto', fontSize: 18 }} />}
                        </ToggleButton>
                        <ToggleButton
                            value="learning"
                            selected={!!currentStatus.learning}
                            onChange={() => { onToggleStatus('learning'); }}
                            size="small"
                            sx={{
                                '&.Mui-selected': {
                                    bgcolor: '#B21E84',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    borderColor: '#B21E84',
                                    '&:hover': { bgcolor: '#B21E84' },
                                    '& .MuiSvgIcon-root': { color: 'white' }
                                }
                            }}
                        >
                            <School sx={{ mr: 1, fontSize: 22 }} />
                            <Typography variant="body2" sx={{ fontWeight: 'inherit', textAlign: 'left' }}>Currently Learning</Typography>
                            {currentStatus.learning && <Flag sx={{ ml: 'auto', fontSize: 18 }} />}
                        </ToggleButton>
                        <ToggleButton
                            value="toLearn"
                            selected={!!currentStatus.toLearn}
                            onChange={() => { onToggleStatus('toLearn'); }}
                            size="small"
                            sx={{
                                '&.Mui-selected': {
                                    bgcolor: '#9123A6',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    borderColor: '#9123A6',
                                    '&:hover': { bgcolor: '#9123A6' },
                                    '& .MuiSvgIcon-root': { color: 'white' }
                                }
                            }}
                        >
                            <MenuBook sx={{ mr: 1, fontSize: 22 }} />
                            <Typography variant="body2" sx={{ fontWeight: 'inherit', textAlign: 'left' }}>To Learn</Typography>
                            {currentStatus.toLearn && <Flag sx={{ ml: 'auto', fontSize: 18 }} />}
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mt: 2,
                            mb: 1
                        }}>
                        <Typography variant="subtitle2">My Skill Level</Typography>
                        <Rating
                            name="exercise-skill-level"
                            value={currentStatus.skillLevel ?? 0}
                            onChange={onRatingChange}
                            size="medium"
                        />
                    </Box>
                </Box>
            )}
        </Paper>
    );
};

export default ExerciseProgressCard;
