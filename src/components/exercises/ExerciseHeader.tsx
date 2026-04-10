import { Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';

import ArrowBack from '@mui/icons-material/ArrowBack';
import EditNote from '@mui/icons-material/EditNote';
import Delete from '@mui/icons-material/Delete';

import type { Exercise } from '../../types';

interface ExerciseHeaderProps {
    exercise: Exercise;
    onDelete: () => void;
}

const ExerciseHeader = ({ exercise, onDelete }: ExerciseHeaderProps) => {
    return (
        <Box
            sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start"
            }}>
            <Box>
                <Button
                    component={RouterLink}
                    to="/exercises"
                    startIcon={<ArrowBack />}
                    sx={{ mb: 1, color: 'text.secondary' }}
                >
                    Back to Overview
                </Button>
                <Avatar 
                    src={exercise.icon_url ? 
                        `${import.meta.env.BASE_URL}exercises/${exercise.icon_url}` 
                        : undefined}
                    alt={exercise.name}
                    sx={{ 
                        width: 100, 
                        height: 100, 
                        mb: 2, 
                    }}
                >
                    {exercise.name.charAt(0)}
                </Avatar>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                    {exercise.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Chip
                        label={exercise.type}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                    />
                    <Chip
                        label={exercise.bodypart}
                        color="secondary"
                        variant="outlined"
                        size="small"
                    />
                    <Chip
                        label={exercise.category}
                        color="info"
                        variant="outlined"
                        size="small"
                    />
                </Box>
                {exercise.aliases.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
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
                {exercise.name_url && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: "text.secondary",
                            display: "block"
                        }}>
                        URL Name: {exercise.name_url}
                    </Typography>
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
