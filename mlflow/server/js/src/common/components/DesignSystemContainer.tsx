import React, { useCallback, useMemo, useRef } from 'react';
import { DesignSystemProvider, DesignSystemThemeProvider, useDesignSystemTheme } from '@databricks/design-system';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { ColorsPaletteDatalist } from './ColorsPaletteDatalist';
import { usePatternFlyTheme } from '../hooks/usePatternFlyTheme';
import { buildPatternFlyTheme } from '../theme/buildPatternFlyTheme';
import '@patternfly/react-core/dist/styles/base.css';
import './patternfly/pf-shell-overrides.css';

const isInsideShadowDOM = (element: HTMLDivElement | null): boolean =>
  element instanceof window.Node && element.getRootNode() !== document;

type DesignSystemContainerProps = {
  isDarkTheme?: boolean;
  children: React.ReactNode;
};

const ThemeProvider = ({ children, isDarkTheme }: { children?: React.ReactNode; isDarkTheme?: boolean }) => {
  // eslint-disable-next-line react/forbid-elements
  return <DesignSystemThemeProvider isDarkMode={isDarkTheme}>{children}</DesignSystemThemeProvider>;
};

export const MLflowImagePreviewContainer = React.createContext({
  getImagePreviewPopupContainer: () => document.body,
});

/**
 * MFE-safe DesignSystemProvider that checks if the application is
 * in the context of the Shadow DOM and if true, provides dedicated
 * DOM element for the purpose of housing modals/popups there.
 */
export const DesignSystemContainer = (props: DesignSystemContainerProps) => {
  const modalContainerElement = useRef<HTMLDivElement | null>(null);
  const { isDarkTheme = false, children } = props;
  const { isPatternFlyEnabled } = usePatternFlyTheme();

  const containerClassName = useMemo(() => {
    return isPatternFlyEnabled ? 'pf-shell-root' : '';
  }, [isPatternFlyEnabled]);

  const getPopupContainer = useCallback(() => {
    const modelContainerEle = modalContainerElement.current;
    if (modelContainerEle !== null && isInsideShadowDOM(modelContainerEle)) {
      return modelContainerEle;
    }
    return document.body;
  }, []);

  // Specialized container for antd image previews, always rendered near MLflow
  // to maintain prefixed CSS classes and styles.
  const getImagePreviewPopupContainer = useCallback(() => {
    const modelContainerEle = modalContainerElement.current;
    if (modelContainerEle !== null) {
      return modelContainerEle;
    }
    return document.body;
  }, []);

  return (
    <ThemeProvider isDarkTheme={isDarkTheme}>
      <DesignSystemProvider getPopupContainer={getPopupContainer} {...props}>
        <MLflowImagePreviewContainer.Provider value={{ getImagePreviewPopupContainer }}>
          <div className={containerClassName}>{children}</div>
          <div ref={modalContainerElement} />
        </MLflowImagePreviewContainer.Provider>
      </DesignSystemProvider>
      <ColorsPaletteDatalist />
    </ThemeProvider>
  );
};
