import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { UserProfileProvider } from './contexts/UserProfileContext';
import { WardrobeProvider } from './contexts/WardrobeContext';
import { ConversationProvider } from './contexts/ConversationContext';
import router from './router';

function App() {
  return (
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
  );
}

export default App;
