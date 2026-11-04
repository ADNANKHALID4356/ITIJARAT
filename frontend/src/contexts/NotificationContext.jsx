import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 3000, // Reduced from 4000 to 3000ms
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove notification after duration
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-[#5B1830]" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-[#C43D43]" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-[#A66A12]" />;
      default:
        return <Info className="w-5 h-5 text-[#3977B8]" />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'success':
        return 'bg-white border-[#E8DED8] border-l-4 border-l-[#5B1830] text-[#241A1D] shadow-xl';
      case 'error':
        return 'bg-white border-[#E8DED8] border-l-4 border-l-[#C43D43] text-[#241A1D] shadow-xl';
      case 'warning':
        return 'bg-white border-[#E8DED8] border-l-4 border-l-[#A66A12] text-[#241A1D] shadow-xl';
      default:
        return 'bg-white border-[#E8DED8] border-l-4 border-l-[#3977B8] text-[#241A1D] shadow-xl';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-full max-w-sm pr-4 sm:pr-0 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            w-full p-3 sm:p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out
            transform translate-x-0 opacity-100 animate-slide-in pointer-events-auto
            ${getColors(notification.type)}
          `}
          style={{ marginLeft: 'auto' }}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              {notification.title && (
                <p className="text-sm font-semibold mb-1 leading-tight break-words text-[#241A1D] font-body">
                  {notification.title}
                </p>
              )}
              <p className={`text-xs sm:text-sm leading-tight break-words text-[#746B6C] font-body ${notification.title ? '' : 'font-medium'}`}>
                {notification.message}
              </p>
            </div>
            <div className="ml-2 sm:ml-3 flex-shrink-0">
              <button
                className="rounded-md inline-flex text-[#8B8080] hover:text-[#241A1D] focus:outline-none transition-colors p-1 hover:bg-black/5"
                onClick={() => removeNotification(notification.id)}
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationProvider;

// CSS for animations (add to your global CSS)
const styles = `
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
`;
