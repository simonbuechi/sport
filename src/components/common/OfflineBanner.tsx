import Alert from '@mui/material/Alert';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useTranslation } from 'react-i18next';

const OfflineBanner = () => {
    const isOnline = useOnlineStatus();
    const { t } = useTranslation();

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
            {t('common.offline')}
        </Alert>
    );
};

export default OfflineBanner;
