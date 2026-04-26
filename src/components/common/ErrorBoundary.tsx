import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/Error';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidMount() {
        window.addEventListener('unhandledrejection', this.handlePromiseRejection);
    }

    componentWillUnmount() {
        window.removeEventListener('unhandledrejection', this.handlePromiseRejection);
    }

    handlePromiseRejection = (event: PromiseRejectionEvent) => {
        this.setState({
            hasError: true,
            error: event.reason instanceof Error ? event.reason : new Error(String(event.reason))
        });
    };

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <Container maxWidth="sm" sx={{ mt: 10 }}>
                    <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                        <ErrorOutlineIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
                        <Typography variant="h4" gutterBottom>
                            Oops! Something went wrong.
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            The application encountered an unexpected error.
                        </Typography>
                        {this.state.error && (
                            <Box sx={{ 
                                bgcolor: 'grey.100', 
                                p: 2, 
                                borderRadius: 1, 
                                textAlign: 'left',
                                mb: 3,
                                overflowX: 'auto'
                            }}>
                                <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace' }}>
                                    {this.state.error.toString()}
                                </Typography>
                            </Box>
                        )}
                        <Button 
                            variant="contained" 
                            onClick={this.handleReset}
                            fullWidth
                        >
                            Return to Dashboard
                        </Button>
                    </Paper>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
