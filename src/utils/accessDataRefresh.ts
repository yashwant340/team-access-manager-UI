const accessDataChangedEvent = 'access-management:data-changed';

export const notifyAccessDataChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(accessDataChangedEvent));
  }
};

export const subscribeToAccessDataChanges = (listener: () => void) => {
  if (typeof window === 'undefined') return () => undefined;

  window.addEventListener(accessDataChangedEvent, listener);
  return () => window.removeEventListener(accessDataChangedEvent, listener);
};
