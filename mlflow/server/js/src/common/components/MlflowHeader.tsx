import ExperimentTrackingRoutes from '../../experiment-tracking/routes';
import { Link } from '../utils/RoutingUtils';
import { HomePageDocsUrl, Version } from '../constants';
import { DarkThemeSwitch } from '@mlflow/mlflow/src/common/components/DarkThemeSwitch';
import { Button, MenuIcon, Switch, Tooltip, useDesignSystemTheme } from '@databricks/design-system';
import { MlflowLogo } from './MlflowLogo';
import { usePatternFlyTheme } from '../hooks/usePatternFlyTheme';

export const MlflowHeader = ({
  isDarkTheme = false,
  setIsDarkTheme = (val: boolean) => {},
  sidebarOpen,
  toggleSidebar,
}: {
  isDarkTheme?: boolean;
  setIsDarkTheme?: (isDarkTheme: boolean) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}) => {
  const { theme } = useDesignSystemTheme();
  const { isPatternFlyEnabled, toggle } = usePatternFlyTheme();
  return (
    <header
      css={{
        backgroundColor: theme.colors.backgroundSecondary,
        color: theme.colors.textSecondary,
        display: 'flex',
        paddingLeft: theme.spacing.sm,
        paddingRight: theme.spacing.md,
        paddingTop: theme.spacing.sm + theme.spacing.xs,
        paddingBottom: theme.spacing.xs,
        a: {
          color: theme.colors.textSecondary,
        },
        alignItems: 'center',
      }}
    >
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Button
          type="tertiary"
          componentId="mlflow_header.toggle_sidebar_button"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          aria-pressed={sidebarOpen}
          icon={<MenuIcon />}
        />
        <Link to={ExperimentTrackingRoutes.rootRoute}>
          <MlflowLogo
            css={{
              display: 'block',
              height: theme.spacing.md * 2,
              color: theme.colors.textPrimary,
            }}
          />
        </Link>
        <span
          css={{
            fontSize: theme.typography.fontSizeSm,
          }}
        >
          {Version}
        </span>
      </div>
      <div css={{ flex: 1 }} />
      <div css={{ display: 'flex', gap: theme.spacing.lg, alignItems: 'center' }}>
        <Tooltip
          content={isPatternFlyEnabled ? 'Switch to Databricks theme' : 'Switch to PatternFly theme'}
          side="bottom"
          componentId="mlflow_header.patternfly_theme_toggle_tooltip"
        >
          <Switch
            checked={isPatternFlyEnabled}
            onChange={toggle}
            aria-label="Toggle PatternFly theme"
            componentId="mlflow_header.patternfly_theme_toggle"
          />
        </Tooltip>
        <DarkThemeSwitch isDarkTheme={isDarkTheme} setIsDarkTheme={setIsDarkTheme} />
        <a href="https://github.com/mlflow/mlflow">GitHub</a>
        <a href={HomePageDocsUrl}>Docs</a>
      </div>
    </header>
  );
};
