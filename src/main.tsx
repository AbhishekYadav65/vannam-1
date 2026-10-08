import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { StoreProvider } from './store/useStore';
import { FXProvider } from './components/FlowerFX';
import { PreviewProvider } from './components/PressPreview';
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import '@fontsource/bagel-fat-one/400.css';
import '@fontsource/caveat-brush/400.css';
import './index.css';
import './components/Photo.css';
import './components/FlowerFX.css';
import './components/PressPreview.css';
import './typography.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <FXProvider>
          <PreviewProvider>
            <App />
          </PreviewProvider>
        </FXProvider>
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>
);
