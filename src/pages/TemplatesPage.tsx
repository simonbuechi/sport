import { lazy, Suspense } from 'react';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
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
            <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}>
                <TemplatesSection
                    userId={currentUser?.uid ?? ''}
                    exercises={exercises}
                    onBack={() => navigate('/journal')}
                />
            </Suspense>
        </Container>
    );
};

export default TemplatesPage;
