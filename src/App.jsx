import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { UserProfileProvider } from './contexts/UserProfileContext';
import { WardrobeProvider } from './contexts/WardrobeContext';
import { ConversationProvider } from './contexts/ConversationContext';
import router from './router';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <UserProfileProvider>
            <WardrobeProvider>
              <ConversationProvider>
                <RouterProvider router={router} />
              </ConversationProvider>
            </WardrobeProvider>
          </UserProfileProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
