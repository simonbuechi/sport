import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, persistenceReady } from '../firebase/config';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { googleSignIn } = useAuth();

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (password !== passwordConfirm) {
            setError('Passwords do not match'); return;
        }

        try {
            setError('');
            setLoading(true);
            await persistenceReady;
            await createUserWithEmailAndPassword(auth, email, password);
            await navigate('/');
        } catch (err) {
            setError('Failed to create an account');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        try {
            setError('');
            setLoading(true);
            await googleSignIn();
            await navigate('/');
        } catch (err) {
            setError('Failed to sign up with Google');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Register
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
                    <TextField
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        required
                        value={passwordConfirm}
                        onChange={(e) => { setPasswordConfirm(e.target.value); }}
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
                        Sign Up
                    </Button>
                    <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        disabled={loading}
                        onClick={handleGoogleRegister}
                        startIcon={<GoogleIcon />}
                        sx={{ mb: 2 }}
                    >
                        Sign up with Google
                    </Button>
                </form>
                <Typography align="center" variant="body2">
                    Already have an account? <Link to="/login">Log in</Link>
                </Typography>
            </Paper>
        </Box>
    );
};

export default Register;
