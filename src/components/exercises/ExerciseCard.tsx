import { memo } from 'react';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { useNavigate } from 'react-router-dom';
import type { Exercise, MarkedStatus } from '../../types';
import MarkerIcons from './MarkerIcons';
import LinkIcon from '@mui/icons-material/Link';

interface ExerciseCardProps {
    exercise: Exercise;
    markerStatus?: MarkedStatus;
}

const ExerciseCard = ({ exercise, markerStatus }: ExerciseCardProps) => {
    const navigate = useNavigate();

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardActionArea 
                onClick={() => navigate(`/exercises/${exercise.id}`)} 
                sx={{ flexGrow: 1 }}
                aria-label={`View details for ${exercise.name}`}
            >
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Stack sx={{ alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
                        <Stack sx={{ flexWrap: "wrap" }} spacing={0.5}>
                            <Chip
                                label={exercise.type}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ textTransform: 'capitalize' }}
                            />
                            <Chip
                                label={exercise.bodypart}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                            <Chip
                                label={exercise.category}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        </Stack>
                        <Stack spacing={0.5} sx={{ color: 'text.secondary' }}>
                            {exercise.links && exercise.links.length > 0 && <LinkIcon fontSize="small" />}
                        </Stack>
                    </Stack>

                    <Stack spacing={2} sx={{ mb: 2 }}>
                        <Avatar
                            src={exercise.icon_url ?
                                `${import.meta.env.BASE_URL}exercises/${exercise.icon_url}`
                                : undefined}
                            alt={exercise.name}
                            sx={{
                                width: 56,
                                height: 56,
                            }}
                        >
                            {exercise.name.charAt(0)}
                        </Avatar>
                        <Typography variant="h5" component="div">
                            {exercise.name}
                        </Typography>
                    </Stack>

                    {exercise.description && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                flexGrow: 1,
                                mb: 2
                            }}>
                            {exercise.description}
                        </Typography>
                    )}

                    {markerStatus && (
                        <Stack sx={{ justifyContent: "flex-end" }}>
                            <MarkerIcons status={markerStatus} />
                        </Stack>
                    )}
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default memo(ExerciseCard);
