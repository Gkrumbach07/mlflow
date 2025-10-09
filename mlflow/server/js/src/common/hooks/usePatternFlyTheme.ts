import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = '_mlflow_patternfly_theme_enabled';

const readInitialState = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('PatternFly theme: unable to read toggle state', error);
  }
  return false;
};

export const usePatternFlyTheme = () => {
  const [isEnabled, setIsEnabled] = useState(readInitialState);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, String(isEnabled));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('PatternFly theme: unable to persist toggle state', error);
    }
  }, [isEnabled]);

  const toggle = useCallback(() => {
    setIsEnabled((current) => !current);
  }, []);

  return { isPatternFlyEnabled: isEnabled, toggle };
};
