import { Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
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
        <Stack sx={{ alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ flex: 1 }}>
                <Button
                    component={RouterLink}
                    to="/exercises"
                    startIcon={<ArrowBack />}
                    sx={{ mb: 2, color: 'text.secondary' }}
                >
                    Back to Overview
                </Button>

                <Stack spacing={3} sx={{ mb: 3 }}>
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
                    <Stack spacing={1}>
                        <Typography variant="h4" component="h1">
                            {exercise.name}
                        </Typography>
                        <Tooltip title={isFavorite ? "Remove from Favorites" : "Mark as Favorite"}>
                            <IconButton
                                onClick={onToggleFavorite}
                                color={isFavorite ? "warning" : "default"}
                                size="large"
                                aria-label={isFavorite ? "remove from favorites" : "mark as favorite"}
                            >
                                {isFavorite ? <Star fontSize="large" /> : <StarBorder fontSize="large" />}
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>

                <Stack spacing={1.5} sx={{ flexWrap: "wrap", mb: 2 }}>
                    <Chip
                        label={`Type: ${exercise.type}`}
                        color="primary"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                    />
                    <Chip
                        label={`Body part: ${exercise.bodypart}`}
                        color="primary"
                        variant="outlined"
                    />
                    <Chip
                        label={`Category: ${exercise.category}`}
                        color="primary"
                        variant="outlined"
                    />
                </Stack>

                {exercise.aliases.length > 0 && (
                    <Stack spacing={1} sx={{ flexWrap: "wrap", mb: 1 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", }}>
                            Also known as:
                        </Typography>
                        {exercise.aliases.map((alias, index) => (
                            <Typography
                                key={index}
                                variant="caption"
                                sx={{
                                    color: "text.secondary"
                                }}>
                                {alias}{index < exercise.aliases.length - 1 ? ', ' : ''}
                            </Typography>
                        ))}
                    </Stack>
                )}
            </Box>
            <Stack spacing={1}>
                <Button
                    component={RouterLink}
                    to={`/exercises/${exercise.id}/edit`}
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<EditNote />}
                    disabled
                >
                    Edit
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<Delete />}
                    onClick={onDelete}
                    disabled
                >
                    Delete
                </Button>
            </Stack>
        </Stack>
    );
};

export default ExerciseHeader;
