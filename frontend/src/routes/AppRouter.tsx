import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

// Feature Views
import { LoginView, RegisterView, ForgotPasswordView, OTPVerifyView } from '../features/auth';
import { ActivityListView, ActivityDetailView } from '../features/activities';
import { FeedView, PostsView } from '../features/posts';
import { MyRegistrationsView } from '../features/registrations';
import { ProfileView } from '../features/profile';
import { OrganizerDashboard, RequestOrganizerView } from '../features/organizer';
import { AdminDashboard } from '../features/admin';
import { AboutUsView } from '../features/about';

export const AppRouter: React.FC = () => {
  const { currentUser } = useApp();
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/feed');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/feed';
      setCurrentHash(hash);
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Parse path and params
  const rawPath = currentHash.replace(/^#\/?/, '').split('?')[0] || 'feed';
  const queryParams = new URLSearchParams(currentHash.split('?')[1] || '');

  // Route matching:
  // 1. Auth routes
  if (rawPath === 'login') {
    return <LoginView />;
  }

  if (rawPath === 'register') {
    return <RegisterView />;
  }

  if (rawPath === 'forgot-password') {
    return <ForgotPasswordView />;
  }

  if (rawPath === 'verify-otp') {
    const email = queryParams.get('email') || '';
    const flow = (queryParams.get('flow') as 'register' | 'forgot_password') || 'register';
    return <OTPVerifyView email={email} flow={flow} />;
  }

  // 2. Activity detail route: activity/:id
  if (rawPath.startsWith('activity/')) {
    const activityId = rawPath.replace('activity/', '');
    return <ActivityDetailView activityId={activityId} />;
  }

  // 3. Activities list route
  if (rawPath === 'activities') {
    return <ActivityListView />;
  }

  // 4. Posts page
  if (rawPath === 'posts') {
    return <PostsView />;
  }

  // 5. About us page
  if (rawPath === 'about') {
    return <AboutUsView />;
  }

  // 6. User Profile
  if (rawPath === 'profile') {
    return <ProfileView />;
  }

  // 7. My Registrations (Volunteer only)
  if (rawPath === 'my-registrations') {
    if (!currentUser) {
      window.location.hash = '#/login';
      return null;
    }
    return <MyRegistrationsView />;
  }

  // 8. Request Organizer (Volunteer only)
  if (rawPath === 'request-organizer') {
    if (!currentUser) {
      window.location.hash = '#/login';
      return null;
    }
    return <RequestOrganizerView />;
  }

  // 9. Organizer Dashboard (Organizer or Admin)
  if (rawPath === 'organizer/dashboard' || rawPath === 'organizer') {
    if (!currentUser) {
      window.location.hash = '#/login';
      return null;
    }
    if (currentUser.role !== 'Organizer' && currentUser.role !== 'Admin') {
      window.location.hash = '#/feed';
      return null;
    }
    return <OrganizerDashboard />;
  }

  // 10. Admin Dashboard (Admin only)
  if (rawPath === 'admin/dashboard' || rawPath === 'admin') {
    if (!currentUser || currentUser.role !== 'Admin') {
      window.location.hash = '#/feed';
      return null;
    }
    return <AdminDashboard />;
  }

  // Default: Feed / Home view
  return <FeedView mode="home" />;
};

export default AppRouter;
