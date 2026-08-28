import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { IncompleteProfileBanner } from './IncompleteProfileBanner';
import { Toast } from '../ui/Toast';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { PromptDialog } from '../ui/PromptDialog';

interface AppLayoutProps {
  children: React.ReactNode;
  showIncompleteBanner?: boolean;
  onDismissIncompleteBanner?: () => void;
  hideHeaderFooter?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showIncompleteBanner = false,
  onDismissIncompleteBanner = () => {},
  hideHeaderFooter = false
}) => {
  const {
    isAuthLoading,
    notification,
    confirmDialog,
    closeConfirm,
    promptDialog,
    closePrompt
  } = useApp();

  return (
    <div className="relative overflow-x-hidden min-h-screen flex flex-col bg-background text-on-surface antialiased transition-all">
      {/* Top Loading Bar Overlay */}
      {isAuthLoading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-[9999] overflow-hidden">
          <div className="h-full bg-[#006d37] w-1/2 animate-pulse rounded-r-full"></div>
        </div>
      )}

      {/* Toast Alert */}
      <Toast notification={notification} />

      {/* Confirm Modal Dialog */}
      <ConfirmDialog dialog={confirmDialog} onClose={closeConfirm} />

      {/* Prompt Modal Dialog */}
      <PromptDialog dialog={promptDialog} onClose={closePrompt} />

      {!hideHeaderFooter && <Navbar />}

      {/* Profile Incomplete Reminder Banner */}
      {!hideHeaderFooter && (
        <IncompleteProfileBanner
          show={showIncompleteBanner}
          onDismiss={onDismissIncompleteBanner}
        />
      )}

      {/* Main Content */}
      <main className="flex-grow w-full overflow-x-hidden flex flex-col">
        {children}
      </main>

      {!hideHeaderFooter && <Footer />}
    </div>
  );
};

export default AppLayout;
