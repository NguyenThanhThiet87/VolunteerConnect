import React from 'react';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './shared/components/layout/AppLayout';
import { AppRouter } from './routes/AppRouter';
import './App.css';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppLayout>
        <AppRouter />
      </AppLayout>
    </AppProvider>
  );
};

export default App;
