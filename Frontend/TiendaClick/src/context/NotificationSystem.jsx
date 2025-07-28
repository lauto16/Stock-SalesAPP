import { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((type, message, timeout) => {
  const id = uuidv4();
  const newNotification = { id, type, message };

  const finalTimeout =
    timeout !== undefined
      ? timeout
      : type === 'success'
        ? 900
        : 4000; 

  setNotifications(prev => [...prev, newNotification]);

  setTimeout(() => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, finalTimeout);
}, []);

  const removeNotification = id => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div
        className="position-fixed top-0 start-50 translate-middle-x p-3 d-flex flex-column align-items-center"
        style={{ zIndex: 1051, maxWidth: '90%' }}
      >
        {notifications.map(({ id, type, message }) => (
          <div
            key={id}
            className={`alert alert-${type} alert-dismissible fade show mb-2 event-handler-${type}`}
            role="alert"
          >
            {message}
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => removeNotification(id)}
            ></button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
