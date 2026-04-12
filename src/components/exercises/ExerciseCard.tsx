import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { useNavigate } from 'react-router-dom';
import type { Exercise, UserProfile } from '../../types';
import MarkerIcons from './MarkerIcons';
import LinkIcon from '@mui/icons-material/Link';

interface ExerciseCardProps {
    exercise: Exercise;
    userProfile?: UserProfile | null;
}

const ExerciseCard = ({ exercise, userProfile }: ExerciseCardProps) => {
    const navigate = useNavigate();
    const markerStatus = userProfile?.markedExercises[exercise.id];

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardActionArea onClick={() => navigate(`/exercises/${exercise.id}`)} sx={{ flexGrow: 1 }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
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
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5, color: 'text.secondary' }}>
                            {exercise.links && exercise.links.length > 0 && <LinkIcon fontSize="small" />}
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
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
                    </Box>

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
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <MarkerIcons status={markerStatus} />
                        </Box>
                    )}
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default ExerciseCard;
