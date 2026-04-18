import { lazy, Suspense } from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';

const TemplatesSection = lazy(() => import('../components/journal/TemplatesSection'));

const TemplatesPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { exercises } = useExercises();

    return (
        <Container maxWidth="lg">
            <Stack sx={{ justifyContent: "space-between", alignItems: "center", mt: { xs: 1, md: 2 }, mb: { xs: 2, md: 4 } }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/journal')}
                        sx={{ color: 'text.secondary' }}
                    >
                        Back
                    </Button>
                    <Typography variant="h4" component="h1">
                        Templates
                    </Typography>
                </Stack>
            </Stack>

            <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}>
                <TemplatesSection 
                    userId={currentUser?.uid ?? ''} 
                    exercises={exercises} 
                />
            </Suspense>
        </Container>
    );
};

export default TemplatesPage;
