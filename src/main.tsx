import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CustomThemeProvider } from './context/ThemeContext';
import App from './App.tsx';

import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-700.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <CustomThemeProvider>
      <App />
    </CustomThemeProvider>
  </StrictMode>,
)

