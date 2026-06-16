// useTabTracker.js
import { useEffect } from "react";

export default function useTabTracker(onLastTabClose) {
  useEffect(() => {
    const TAB_KEY = 'myApp_activeTabCount';

    // Increment tab count
    const currentCount = parseInt(localStorage.getItem(TAB_KEY) || '0', 10);
    localStorage.setItem(TAB_KEY, currentCount + 1);

    const handleUnload = () => {
      const count = parseInt(localStorage.getItem(TAB_KEY) || '1', 10);
      const newCount = Math.max(0, count - 1);
      localStorage.setItem(TAB_KEY, newCount);

      // If this was the last tab
      if (newCount === 0) {
        localStorage.setItem('myApp_loggedOut', 'true'); // mark that logout should happen
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      handleUnload(); // clean up when tab is closed
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [onLastTabClose]);
}
