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
        <Box sx={{ mb: 2.5 }}>
            <Button
                component={RouterLink}
                to="/exercises"
                startIcon={<ArrowBack fontSize="small" />}
                size="small"
                color="inherit"
                sx={{ mb: 1.5, color: 'text.secondary', px: 1, ml: -1 }}
            >
                {t('exercises.backToOverview')}
            </Button>

            <Stack direction="row" spacing={2.5} sx={{ mb: 2.5, alignItems: 'center' }}>
                <Avatar
                    src={exercise.icon_url ? `${import.meta.env.BASE_URL}exercises/${exercise.icon_url}` : undefined}
                    alt={exercise.name}
                    sx={{
                        width: { xs: 56, md: 72 },
                        height: { xs: 56, md: 72 },
                    }}
                >
                    {exercise.name.charAt(0)}
                </Avatar>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h4" component="h1">
                        {exercise.name}
                    </Typography>
                    <Tooltip title={isFavorite ? t('exercises.removeFavorite') : t('exercises.markFavorite')}>
                        <IconButton
                            onClick={onToggleFavorite}
                            color={isFavorite ? 'warning' : 'default'}
                            aria-label={isFavorite ? t('exercises.removeFavorite') : t('exercises.markFavorite')}
                        >
                            {isFavorite ? <Star /> : <StarBorder />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip
                    label={`${t('exercises.type')}: ${t(`exerciseTypes.${exercise.type}`, { defaultValue: exercise.type })}`}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                />
                <Chip
                    label={`${t('exercises.bodyPart')}: ${t(`bodyParts.${exercise.bodypart}`, { defaultValue: exercise.bodypart })}`}
                    color="primary"
                    variant="outlined"
                    size="small"
                />
                <Chip
                    label={`${t('exercises.category')}: ${t(`categories.${exercise.category}`, { defaultValue: exercise.category })}`}
                    color="primary"
                    variant="outlined"
                    size="small"
                />
            </Stack>
        </Box>
    );
};

export default memo(ExerciseHeader);
