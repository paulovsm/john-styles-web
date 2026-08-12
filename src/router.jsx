import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import WardrobePage from './pages/WardrobePage';
import HistoryPage from './pages/HistoryPage';
import TryOnPage from './pages/TryOnPage';
import OnboardingPage from './pages/OnboardingPage';
import GalleryPage from './pages/GalleryPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import BusinessPage from './pages/BusinessPage';
import SubscriptionPage from './pages/SubscriptionPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import AdminBlogPage from './pages/AdminBlogPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/privacy',
        element: <PrivacyPolicyPage />,
    },
    {
        path: '/empresas',
        element: <BusinessPage />,
    },
    {
        path: '/assinatura',
        element: <SubscriptionPage />,
    },
    {
        path: '/blog',
        element: <BlogPage />,
    },
    {
        path: '/blog/:slug',
        element: <BlogPostPage />,
    },
    {
        path: '/admin/blog',
        element: (
            <AdminRoute>
                <AdminBlogPage />
            </AdminRoute>
        ),
    },
    {
        path: '/dashboard',
        element: (
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        ),
    },
    {
        path: '/chat',
        element: (
            <ProtectedRoute>
                <ChatPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/wardrobe',
        element: (
            <ProtectedRoute>
                <WardrobePage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/history',
        element: (
            <ProtectedRoute>
                <HistoryPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/try-on',
        element: (
            <ProtectedRoute>
                <TryOnPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/onboarding',
        element: (
            <ProtectedRoute>
                <OnboardingPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/gallery',
        element: (
            <ProtectedRoute>
                <GalleryPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '*',
        element: <NotFoundPage />,
    },
]);

export default router;
