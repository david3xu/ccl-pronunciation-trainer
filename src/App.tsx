import React, { Suspense } from 'react';
import { AppContent } from './components/AppContent';
import { ToastProvider } from './components/shared/ToastProvider';
import './css/tailwind.css';

const App: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Suspense>
  );
};

export default App;
