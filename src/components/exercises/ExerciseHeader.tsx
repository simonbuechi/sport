import { memo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';

import ArrowBack from '@mui/icons-material/ArrowBack';
import Star from '@mui/icons-material/Star';
import StarBorder from '@mui/icons-material/StarBorder';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';

import type { Exercise } from '../../types';

interface ExerciseHeaderProps {
    exercise: Exercise;
    isFavorite: boolean;
    onToggleFavorite: () => void;
}

const ExerciseHeader = ({ exercise, isFavorite, onToggleFavorite }: ExerciseHeaderProps) => {
    const { t } = useTranslation();

    return (
        <Stack sx={{ alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ flex: 1 }}>
                <Button
                    component={RouterLink}
                    to="/exercises"
                    startIcon={<ArrowBack />}
                    sx={{ mb: 2, color: 'text.secondary' }}
                >
                    {t('exercises.backToOverview')}
                </Button>

                <Stack direction="row" spacing={3} sx={{ mb: 3, alignItems: 'center' }}>
                    <Avatar
                        src={exercise.icon_url ?
                            `${import.meta.env.BASE_URL}exercises/${exercise.icon_url}`
                            : undefined}
                        alt={exercise.name}
                        sx={{
                            width: { xs: 60, md: 80 },
                            height: { xs: 60, md: 80 },
                        }}
                    >
                        {exercise.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h4" component="h1">
                            {exercise.name}
                        </Typography>
                        <Tooltip title={isFavorite ? t('exercises.removeFavorite') : t('exercises.markFavorite')}>
                            <IconButton
                                onClick={onToggleFavorite}
                                color={isFavorite ? "warning" : "default"}
                                size="large"
                                aria-label={isFavorite ? t('exercises.removeFavorite') : t('exercises.markFavorite')}
                            >
                                {isFavorite ? <Star fontSize="large" /> : <StarBorder fontSize="large" />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Stack>

                <Stack spacing={1.5} sx={{ flexWrap: "wrap", mb: 2 }}>
                    <Chip
                        label={`${t('exercises.type')}: ${t(`exerciseTypes.${exercise.type}`, { defaultValue: exercise.type })}`}
                        color="primary"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                    />
                    <Chip
                        label={`${t('exercises.bodyPart')}: ${t(`bodyParts.${exercise.bodypart}`, { defaultValue: exercise.bodypart })}`}
                        color="primary"
                        variant="outlined"
                    />
                    <Chip
                        label={`${t('exercises.category')}: ${t(`categories.${exercise.category}`, { defaultValue: exercise.category })}`}
                        color="primary"
                        variant="outlined"
                    />
                </Stack>


            </Box>
        </Stack>
    );
};

export default memo(ExerciseHeader);
