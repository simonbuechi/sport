import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

import ReloadPrompt from './components/common/ReloadPrompt';

function App() {
  return (
    <PwaProvider>
      <AuthProvider>
        <ExercisesProvider>
          <Router basename="/sport/">
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="exercises" element={<Exercises />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="exercises/:id" element={<ExerciseDetails />} />
                <Route
                  path="exercises/new"
                  element={
                    <ProtectedRoute>
                      <ExerciseForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="exercises/:id/edit"
                  element={
                    <ProtectedRoute>
                      <ExerciseForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="journal"
                  element={
                    <ProtectedRoute>
                      <Journal />
                    </ProtectedRoute>
                  }
                />
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
