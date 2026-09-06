import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { UserProfileProvider } from './contexts/UserProfileContext';
import { WardrobeProvider } from './contexts/WardrobeContext';
import { ConversationProvider } from './contexts/ConversationContext';
import router from './router';
import SkipLink from './components/common/SkipLink';
import { ExperienceProvider } from './experience/ExperienceContext';

function App() {
  return (
    <ExperienceProvider>
      <ThemeProvider>
        <SkipLink />
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
    </ExperienceProvider>
  );
}

export default App;
