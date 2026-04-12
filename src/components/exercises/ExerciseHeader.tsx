import { Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';

import ArrowBack from '@mui/icons-material/ArrowBack';
import EditNote from '@mui/icons-material/EditNote';
import Delete from '@mui/icons-material/Delete';
import Star from '@mui/icons-material/Star';
import StarBorder from '@mui/icons-material/StarBorder';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import type { Exercise } from '../../types';

interface ExerciseHeaderProps {
    exercise: Exercise;
    onDelete: () => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
}

const ExerciseHeader = ({ exercise, onDelete, isFavorite, onToggleFavorite }: ExerciseHeaderProps) => {
    return (
        <Box
            sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start"
            }}>
            <Box sx={{ flex: 1 }}>
                <Button
                    component={RouterLink}
                    to="/exercises"
                    startIcon={<ArrowBack />}
                    sx={{ mb: 2, color: 'text.secondary' }}
                >
                    Back to Overview
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                    <Avatar
                        src={exercise.icon_url ?
                            `${import.meta.env.BASE_URL}exercises/${exercise.icon_url}`
                            : undefined}
                        alt={exercise.name}
                        sx={{
                            width: { xs: 80, md: 100 },
                            height: { xs: 80, md: 100 },
                        }}
                    >
                        {exercise.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                            {exercise.name}
                        </Typography>
                        <Tooltip title={isFavorite ? "Remove from Favorites" : "Mark as Favorite"}>
                            <IconButton
                                onClick={onToggleFavorite}
                                color={isFavorite ? "warning" : "default"}
                                size="large"
                            >
                                {isFavorite ? <Star fontSize="large" /> : <StarBorder fontSize="large" />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                        label={`Type: ${exercise.type}`}
                        color="primary"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                    />
                    <Chip
                        label={`Body part: ${exercise.bodypart}`}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                    />
                    <Chip
                        label={`Category: ${exercise.category}`}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                    />
                </Box>

                {exercise.aliases.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1, alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                            Also known as:
                        </Typography>
                        {exercise.aliases.map((alias, index) => (
                            <Typography
                                key={index}
                                variant="caption"
                                sx={{
                                    color: "text.secondary",
                                    fontStyle: 'italic'
                                }}>
                                {alias}{index < exercise.aliases.length - 1 ? ', ' : ''}
                            </Typography>
                        ))}
                    </Box>
                )}
            </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        component={RouterLink}
                        to={`/exercises/${exercise.id}/edit`}
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<EditNote />}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Delete />}
                        onClick={onDelete}
                    >
                        Delete
                    </Button>
            </Box>
        </Box>
    );
};

export default ExerciseHeader;
