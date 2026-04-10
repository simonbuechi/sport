import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, persistenceReady } from '../firebase/config';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { googleSignIn } = useAuth();

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await persistenceReady;
            await signInWithEmailAndPassword(auth, email, password);
            await navigate('/');
        } catch (err) {
            setError('Failed to log in');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setLoading(true);
            await googleSignIn();
            await navigate('/');
        } catch (err) {
            setError('Failed to log in with Google');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, px: 2 }}>
            <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Login
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        margin="normal"
                        required
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); }}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        required
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        disabled={loading}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Log In
                    </Button>
                    <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        disabled={loading}
                        onClick={handleGoogleLogin}
                        startIcon={<GoogleIcon />}
                        sx={{ mb: 2 }}
                    >
                        Log in with Google
                    </Button>
                </form>
                <Typography align="center" variant="body2">
                    Need an account? <Link to="/register">Register</Link>
                </Typography>
            </Paper>

            <Box sx={{ mt: 4, textAlign: 'center', maxWidth: 400 }}>
                <Typography variant="body2" color="text.secondary">
                    Request, feedback and more information on the project site
                </Typography>
                <Typography component="a" href="https://github.com/simonbuechi/sport" target="_blank" rel="noopener noreferrer" variant="body2" sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                    https://github.com/simonbuechi/sport
                </Typography>
            </Box>
        </Box>
    );
};

export default Login;
