import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import GoogleIcon from '@mui/icons-material/Google';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { auth, persistenceReady } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { createUserProfile } from '../services/db';

const Auth = () => {
    const location = useLocation();
    const isLogin = location.pathname === '/login';
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { googleSignIn } = useAuth();

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (!isLogin && password !== passwordConfirm) {
            setError('Passwords do not match');
            return;
        }

        try {
            setError('');
            setLoading(true);
            await persistenceReady;
            
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                // Create Firestore profile for new user
                await createUserProfile(user.uid, {
                    name: user.displayName ?? email.split('@')[0],
                    weights: [],
                    measurements: [],
                    markedExercises: {}
                });
            }
            
            void navigate('/');
        } catch (_err) {
            setError(isLogin ? 'Failed to log in' : 'Failed to create an account');
            // console.error(_err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        try {
            setError('');
            setLoading(true);
            await googleSignIn();
            
            // Check/Create profile after Google Sign In
            const user = auth.currentUser;
            if (user) {
                await createUserProfile(user.uid, {
                    name: user.displayName ?? user.email?.split('@')[0] ?? 'Athlete',
                    weights: [],
                    measurements: [],
                    markedExercises: {}
                });
            }
            
            void navigate('/');
        } catch (_err) {
            setError(isLogin ? 'Failed to log in with Google' : 'Failed to sign up with Google');
            // console.error(_err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: { xs: 4, md: 8 }, px: 2 }}>
            <Box sx={{ mb: 4, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Box
                    component="img"
                    src={`${import.meta.env.BASE_URL}logo.webp`}
                    alt="Sport Amigo Logo"
                    sx={{
                        width: { xs: 60, md: 80 },
                        height: { xs: 60, md: 80 },
                    }}
                />
                <Typography variant="h2" component="div" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: -2, fontSize: '2.5rem' }}>
                    Sport Amigo
                </Typography>
            </Box>
            <Paper key={isLogin ? 'login' : 'register'} elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    {isLogin ? 'Login' : 'Register'}
                </Typography>
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                <form onSubmit={handleSubmit}>
                    <TextField
                        id="email"
                        name="email"
                        label="Email"
                        type="email"
                        autoComplete="username email"
                        fullWidth
                        margin="normal"
                        required
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); }}
                    />
                    <TextField
                        id="password"
                        name="password"
                        label="Password"
                        type="password"
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        fullWidth
                        margin="normal"
                        required
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); }}
                    />
                    
                    {!isLogin && (
                        <TextField
                            id="passwordConfirm"
                            name="passwordConfirm"
                            label="Confirm Password"
                            type="password"
                            autoComplete="new-password"
                            fullWidth
                            margin="normal"
                            required
                            value={passwordConfirm}
                            onChange={(e) => { setPasswordConfirm(e.target.value); }}
                        />
                    )}
                    
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        disabled={loading}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </Button>
                    
                    <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        disabled={loading}
                        onClick={handleGoogleAuth}
                        startIcon={<GoogleIcon />}
                        sx={{ mb: 2 }}
                    >
                        {isLogin ? 'Log in with Google' : 'Sign up with Google'}
                    </Button>
                </form>
                
                <Typography align="center" variant="body2">
                    {isLogin ? (
                        <>Need an account? <Link to="/register">Register</Link></>
                    ) : (
                        <>Already have an account? <Link to="/login">Log in</Link></>
                    )}
                </Typography>
            </Paper>

            <Box sx={{ mt: 4, textAlign: 'center', maxWidth: 400 }}>
                <Typography variant="body2" color="text.secondary">
                    Request, feedback and more information on the project site
                </Typography>
                <Typography 
                    component="a" 
                    href="https://github.com/simonbuechi/sport" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    variant="body2" 
                    sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                    https://github.com/simonbuechi/sport
                </Typography>
            </Box>
        </Box>
    );
};

export default Auth;
