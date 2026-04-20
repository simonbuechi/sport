import { lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ExercisesProvider } from './context/ExercisesContext';
import { WorkoutsProvider } from './context/WorkoutsContext';
import { PwaProvider } from './context/PwaContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ReloadPrompt from './components/common/ReloadPrompt';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Exercises = lazy(() => import('./pages/Exercises'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const ExerciseDetails = lazy(() => import('./pages/ExerciseDetails'));
const ExerciseForm = lazy(() => import('./pages/ExerciseForm'));
const Journal = lazy(() => import('./pages/Journal'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));
const WorkoutForm = lazy(() => import('./pages/WorkoutForm'));
const WorkoutDetails = lazy(() => import('./pages/WorkoutDetails'));
const ExerciseHistory = lazy(() => import('./pages/ExerciseHistory'));
const WeightHistory = lazy(() => import('./pages/BodyHistory'));

function App() {
  return (
    <PwaProvider>
      <AuthProvider>
        <ExercisesProvider>
          <WorkoutsProvider>
            <Router basename="/">
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  
                  <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                    <Route index element={<Home />} />
                    <Route path="exercises" element={<Exercises />} />
                    <Route path="exercises/:id" element={<ExerciseDetails />} />
                    <Route path="exercises/:id/history" element={<ExerciseHistory />} />
                    <Route path="exercises/new" element={<ExerciseForm />} />
                    <Route path="exercises/:id/edit" element={<ExerciseForm />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="profile/body" element={<Profile />} />
                    <Route path="profile/body/history" element={<WeightHistory />} />
                    <Route path="profile/stats" element={<Profile />} />
                    <Route path="journal" element={<Journal />} />
                    <Route path="journal/templates" element={<TemplatesPage />} />
                    <Route path="journal/new" element={<WorkoutForm />} />
                    <Route path="journal/:id" element={<WorkoutDetails />} />
                    <Route path="journal/:id/edit" element={<WorkoutForm />} />
                  </Route>
                </Route>

              </Routes>
            </Router>
            <ReloadPrompt />
          </WorkoutsProvider>
        </ExercisesProvider>
      </AuthProvider>
    </PwaProvider>
  );
}

export default App;
