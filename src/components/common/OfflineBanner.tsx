import Alert from '@mui/material/Alert';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const OfflineBanner = () => {
    const isOnline = useOnlineStatus();

    if (isOnline) return null;

    return (
        <Alert
            severity="warning"
            icon={<WifiOffIcon fontSize="small" />}
            sx={{
                py: 0.5,
                justifyContent: 'center',
                '& .MuiAlert-message': {
                    textAlign: 'center',
                },
            }}
        >
            You&apos;re offline. Some features may be unavailable.
        </Alert>
    );
};

export default OfflineBanner;
