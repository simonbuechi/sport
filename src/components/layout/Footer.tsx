import { Box, Container, Typography } from '@mui/material';
import packageJson from '../../../package.json';

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: 'background.default'
            }}
        >
            <Container
                maxWidth="lg"
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    gap: 1
                }}
            >

                <Typography variant="body2" sx={{
                    color: "text.secondary"
                }}>
                    &copy; {CURRENT_YEAR} Simon Buechi | v{packageJson.version}
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
