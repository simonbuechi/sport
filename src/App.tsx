import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ExercisesProvider } from './context/ExercisesContext';
import { PwaProvider } from './context/PwaContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Exercises from './pages/Exercises';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ExerciseDetails from './pages/ExerciseDetails';
import ExerciseForm from './pages/ExerciseForm';
import Journal from './pages/Journal';
import SessionForm from './pages/SessionForm';

import ReloadPrompt from './components/common/ReloadPrompt';

function App() {
  return (
    <PwaProvider>
      <AuthProvider>
        <ExercisesProvider>
          <Router basename="/sport/">
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
