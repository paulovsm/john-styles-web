import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Loading from './components/common/Loading';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Only the landing page is bundled eagerly — it is the first paint for anonymous
// visitors. Every other route is fetched on demand, so a visitor no longer
// downloads the try-on engine, the chat/markdown stack and the blog CMS before
// the landing page can render.
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const WardrobePage = lazy(() => import('./pages/WardrobePage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const TryOnPage = lazy(() => import('./pages/TryOnPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const BusinessPage = lazy(() => import('./pages/BusinessPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const AdminBlogPage = lazy(() => import('./pages/AdminBlogPage'));

function RouteFallback() {
    return (
        <main id="main-content" tabIndex={-1} className="flex justify-center items-center min-h-[60vh]">
            <Loading type="spinner" size={40} />
        </main>
    );
}

/** Wraps a lazily-loaded route element in the shared Suspense fallback. */
const withSuspense = (element) => <Suspense fallback={<RouteFallback />}>{element}</Suspense>;

const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        path: '/login',
        element: withSuspense(<LoginPage />),
    },
    {
        path: '/privacy',
        element: withSuspense(<PrivacyPolicyPage />),
    },
    {
        path: '/empresas',
        element: withSuspense(<BusinessPage />),
    },
    {
        path: '/assinatura',
        element: withSuspense(<SubscriptionPage />),
    },
    {
        path: '/blog',
        element: withSuspense(<BlogPage />),
    },
    {
        path: '/blog/:slug',
        element: withSuspense(<BlogPostPage />),
    },
    {
        path: '/admin/blog',
        element: (
            <AdminRoute>
                {withSuspense(<AdminBlogPage />)}
            </AdminRoute>
        ),
    },
    {
        path: '/dashboard',
        element: (
            <ProtectedRoute>
                {withSuspense(<Dashboard />)}
            </ProtectedRoute>
        ),
    },
    {
        path: '/chat',
        element: (
            <ProtectedRoute>
                {withSuspense(<ChatPage />)}
            </ProtectedRoute>
        ),
    },
    {
        path: '/wardrobe',
        element: (
            <ProtectedRoute>
                {withSuspense(<WardrobePage />)}
            </ProtectedRoute>
        ),
    },
    {
        path: '/history',
        element: (
            <ProtectedRoute>
                {withSuspense(<HistoryPage />)}
            </ProtectedRoute>
        ),
    },
    {
        path: '/try-on',
        element: (
            <ProtectedRoute>
                {withSuspense(<TryOnPage />)}
            </ProtectedRoute>
        ),
    },
    {
        path: '/onboarding',
        element: (
            <ProtectedRoute>
                {withSuspense(<OnboardingPage />)}
            </ProtectedRoute>
        ),
    },
    {
        path: '/gallery',
        element: (
            <ProtectedRoute>
                {withSuspense(<GalleryPage />)}
            </ProtectedRoute>
        ),
    },
    {
        path: '*',
        element: withSuspense(<NotFoundPage />),
    },
]);

export default router;
