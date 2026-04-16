import { lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ExercisesProvider } from './context/ExercisesContext';
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
const SessionForm = lazy(() => import('./pages/SessionForm'));

function App() {
  return (
    <PwaProvider>
      <AuthProvider>
        <ExercisesProvider>
          <Router basename="/">
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                
                <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                  <Route index element={<Home />} />
                  <Route path="exercises" element={<Exercises />} />
                  <Route path="exercises/:id" element={<ExerciseDetails />} />
                  <Route path="exercises/new" element={<ExerciseForm />} />
                  <Route path="exercises/:id/edit" element={<ExerciseForm />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="journal" element={<Journal />} />
                  <Route path="journal/new" element={<SessionForm />} />
                  <Route path="journal/:id/edit" element={<SessionForm />} />
                </Route>
              </Route>

            </Routes>
          </Router>
          <ReloadPrompt />
        </ExercisesProvider>
      </AuthProvider>
    </PwaProvider>
  );
}

export default App;
