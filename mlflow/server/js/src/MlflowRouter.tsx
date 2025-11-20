import React, { useEffect, useMemo, useState } from 'react';
import { LegacySkeleton, useDesignSystemTheme } from '@databricks/design-system';

import ErrorModal from './experiment-tracking/components/modals/ErrorModal';
import AppErrorBoundary from './common/components/error-boundaries/AppErrorBoundary';
import {
  HashRouter,
  createHashRouter,
  RouterProvider,
  Outlet,
  Route,
  Routes,
  createLazyRouteElement,
  useLocation,
  useNavigate,
  useParams,
} from './common/utils/RoutingUtils';
import { MlflowHeader } from './common/components/MlflowHeader';
import { shouldEnableWorkspaces } from './common/utils/FeatureUtils';

// Route definition imports:
import { getRouteDefs as getExperimentTrackingRouteDefs } from './experiment-tracking/route-defs';
import { getRouteDefs as getModelRegistryRouteDefs } from './model-registry/route-defs';
import { getRouteDefs as getCommonRouteDefs } from './common/route-defs';
import { useInitializeExperimentRunColors } from './experiment-tracking/components/experiment-page/hooks/useExperimentRunColor';
import { MlflowSidebar } from './common/components/MlflowSidebar';
import {
  DEFAULT_WORKSPACE_NAME,
  extractWorkspaceFromPathname,
  setActiveWorkspace,
  subscribeToWorkspaceChanges,
  getCurrentWorkspace,
  getAvailableWorkspaces,
  hasWorkspaceAccess,
} from './common/utils/WorkspaceUtils';
import { WorkspacePermissionError } from './common/components/WorkspacePermissionError';

/**
 * This is the MLflow default entry/landing route.
 */
const landingRoute = {
  path: '/',
  element: createLazyRouteElement(() => import('./experiment-tracking/components/HomePage')),
  pageId: 'mlflow.experiments.list',
};

type MlflowRouteDef = {
  path?: string;
  element?: React.ReactNode;
  pageId?: string;
  children?: MlflowRouteDef[];
  [key: string]: unknown;
};

/**
 * This is root element for MLflow routes, containing app header.
 */
const MlflowRootRoute = ({
  isDarkTheme,
  setIsDarkTheme,
  useChildRoutesOutlet = false,
  routes,
  invalidWorkspace,
}: {
  isDarkTheme?: boolean;
  setIsDarkTheme?: (isDarkTheme: boolean) => void;
  useChildRoutesOutlet?: boolean;
  routes?: MlflowRouteDef[];
  invalidWorkspace?: string | null;
}) => {
  useInitializeExperimentRunColors();

  const [showSidebar, setShowSidebar] = useState(true);
  const { theme } = useDesignSystemTheme();
  const { experimentId } = useParams();

  // Hide sidebar if we are in a single experiment page
  const isSingleExperimentPage = Boolean(experimentId);
  useEffect(() => {
    setShowSidebar(!isSingleExperimentPage);
  }, [isSingleExperimentPage]);

  return (
    <div css={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ErrorModal />
      <AppErrorBoundary>
        <MlflowHeader
          isDarkTheme={isDarkTheme}
          setIsDarkTheme={setIsDarkTheme}
          sidebarOpen={showSidebar}
          toggleSidebar={() => setShowSidebar((isOpen) => !isOpen)}
        />
        <div
          css={{
            backgroundColor: theme.colors.backgroundSecondary,
            display: 'flex',
            flexDirection: 'row',
            flexGrow: 1,
            minHeight: 0,
          }}
        >
          {showSidebar && <MlflowSidebar />}
          <main
            css={{
              width: '100%',
              backgroundColor: theme.colors.backgroundPrimary,
              margin: theme.spacing.sm,
              borderRadius: theme.borders.borderRadiusMd,
              boxShadow: theme.shadows.md,
              overflowX: 'auto',
            }}
          >
            {invalidWorkspace ? (
              <WorkspacePermissionError workspaceName={invalidWorkspace} />
            ) : (
            <React.Suspense fallback={<LegacySkeleton />}>
              {useChildRoutesOutlet ? (
                <Outlet />
              ) : (
                <Routes>
                  {routes?.map(({ element, pageId, path }) => (
                      <Route key={`${path}-${pageId}`} path={path} element={element} />
                  ))}
                </Routes>
              )}
            </React.Suspense>
            )}
          </main>
        </div>
      </AppErrorBoundary>
    </div>
  );
};

const WorkspaceAwareRootRoute = (props: React.ComponentProps<typeof MlflowRootRoute>) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [invalidWorkspace, setInvalidWorkspace] = useState<string | null>(null);
  const [workspacesLoadedOnce, setWorkspacesLoadedOnce] = useState(false);
  const [showWorkspacePrompt, setShowWorkspacePrompt] = useState(false);

  // Track when workspaces have been loaded at least once
  useEffect(() => {
    const checkWorkspacesLoaded = () => {
      const availableWorkspaces = getAvailableWorkspaces();
      if (availableWorkspaces.length > 0 && !workspacesLoadedOnce) {
        setWorkspacesLoadedOnce(true);
      }
    };

    // Check immediately
    checkWorkspacesLoaded();

    // Check periodically until loaded
    const interval = setInterval(checkWorkspacesLoaded, 100);

    // Clean up after 5 seconds (workspaces should load by then)
    const timeout = setTimeout(() => clearInterval(interval), 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [workspacesLoadedOnce]);

  useEffect(() => {
    if (!shouldEnableWorkspaces()) {
      setActiveWorkspace(null);
      setInvalidWorkspace(null);
      return;
    }

    const workspace = extractWorkspaceFromPathname(location.pathname);
    const activeWorkspace = getCurrentWorkspace();
    const availableWorkspaces = getAvailableWorkspaces();

    if (!workspace) {
      setInvalidWorkspace(null);
      
      // If on root path and no stored workspace, show selection prompt
      if (location.pathname === '/' && !activeWorkspace && workspacesLoadedOnce && availableWorkspaces.length > 0) {
        setShowWorkspacePrompt(true);
        return;
      }
      
      // Determine fallback workspace intelligently
      let fallbackWorkspace = activeWorkspace;
      
      // If no stored workspace or stored workspace not in available list
      if (!fallbackWorkspace || (availableWorkspaces.length > 0 && !availableWorkspaces.includes(fallbackWorkspace))) {
        // Try "default" first if it's available
        if (availableWorkspaces.length > 0) {
          fallbackWorkspace = availableWorkspaces.includes(DEFAULT_WORKSPACE_NAME)
            ? DEFAULT_WORKSPACE_NAME
            : availableWorkspaces[0];
        } else {
          // Workspaces not loaded yet, use default as temporary fallback
          fallbackWorkspace = DEFAULT_WORKSPACE_NAME;
        }
      }
      
      if (activeWorkspace !== fallbackWorkspace) {
        setActiveWorkspace(fallbackWorkspace);
      }
      const suffix = location.pathname === '/' ? '' : location.pathname;
      const search = location.search ?? '';
      const targetPath = `/workspaces/${encodeURIComponent(fallbackWorkspace)}${suffix === '/' ? '' : suffix}`;
      if (location.pathname !== targetPath) {
        navigate(`${targetPath}${search}`, { replace: true });
      }
      return;
    }

    // Only validate after workspaces have been loaded at least once
    if (workspacesLoadedOnce && availableWorkspaces.length > 0 && !hasWorkspaceAccess(workspace)) {
      // Show permission error page - workspace doesn't exist
      // DON'T save invalid workspace to localStorage
      setInvalidWorkspace(workspace);
      return;
    }

    // Valid workspace or still loading - clear any error
    if (workspacesLoadedOnce || availableWorkspaces.length === 0) {
      // Only clear error if we haven't validated yet (still loading)
      // OR if we validated and it's OK
      if (!invalidWorkspace || (availableWorkspaces.length > 0 && hasWorkspaceAccess(workspace))) {
        setInvalidWorkspace(null);
      }
    }
    
    // Only save to localStorage if workspace is valid
    // (If workspaces not loaded yet, assume valid and save)
    // (If workspaces loaded and workspace has access, save)
    const isValidWorkspace = availableWorkspaces.length === 0 || hasWorkspaceAccess(workspace);
    if (workspace !== activeWorkspace && isValidWorkspace) {
      setActiveWorkspace(workspace);
    }
  }, [location, navigate, workspacesLoadedOnce, invalidWorkspace]);

  // Show workspace selection prompt if on root with no preference
  if (showWorkspacePrompt) {
    return (
      <>
        <MlflowRootRoute {...props} invalidWorkspace={invalidWorkspace} />
        <WorkspaceSelectionPrompt
          isOpen={showWorkspacePrompt}
          onClose={() => {
            setShowWorkspacePrompt(false);
            // After closing without selection, redirect to first available workspace
            const availableWorkspaces = getAvailableWorkspaces();
            const fallbackWorkspace = availableWorkspaces[0] || DEFAULT_WORKSPACE_NAME;
            setActiveWorkspace(fallbackWorkspace);
            navigate(`/workspaces/${encodeURIComponent(fallbackWorkspace)}`, { replace: true });
          }}
        />
      </>
    );
  }

  // Pass invalidWorkspace to MlflowRootRoute so it can show error inside the layout
  return <MlflowRootRoute {...props} invalidWorkspace={invalidWorkspace} />;
};

const prefixPathWithWorkspace = (path?: string) => {
  if (!path) {
    return path;
  }

  if (path.startsWith('/workspaces/:workspaceName')) {
    return path;
  }

  if (path === '/') {
    return '/workspaces/:workspaceName';
  }

  if (path === '*') {
    return 'workspaces/:workspaceName/*';
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/workspaces/:workspaceName${normalized}`;
};

const prependWorkspaceToRoutes = (routeDefs: MlflowRouteDef[]): MlflowRouteDef[] =>
  routeDefs.map((route) => {
    const children = route.children ? prependWorkspaceToRoutes(route.children) : undefined;

    return {
      ...route,
      path: prefixPathWithWorkspace(route.path),
      ...(children ? { children } : {}),
    };
  });
export const MlflowRouter = ({
  isDarkTheme,
  setIsDarkTheme,
}: {
  isDarkTheme?: boolean;
  setIsDarkTheme?: (isDarkTheme: boolean) => void;
}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const routes = useMemo<MlflowRouteDef[]>(
    () => [...getExperimentTrackingRouteDefs(), ...getModelRegistryRouteDefs(), landingRoute, ...getCommonRouteDefs()],
    [],
  );
  const workspacesEnabled = shouldEnableWorkspaces();
  const [workspaceKey, setWorkspaceKey] = useState(() => getCurrentWorkspace() ?? DEFAULT_WORKSPACE_NAME);

  useEffect(() => {
    return subscribeToWorkspaceChanges((workspace) => {
      setWorkspaceKey(workspace ?? DEFAULT_WORKSPACE_NAME);
    });
  }, []);

  const workspaceRoutes = useMemo(
    () => (workspacesEnabled ? prependWorkspaceToRoutes(routes) : []),
    [routes, workspacesEnabled],
  );
  const combinedRoutes = useMemo(
    () => (workspacesEnabled ? [...routes, ...workspaceRoutes] : routes),
    [routes, workspaceRoutes, workspacesEnabled],
  );
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const hashRouter = useMemo(
    () =>
      createHashRouter([
        {
          path: '/',
          element: (
            <WorkspaceAwareRootRoute
              key={workspaceKey}
              isDarkTheme={isDarkTheme}
              setIsDarkTheme={setIsDarkTheme}
              useChildRoutesOutlet
            />
          ),
          children: combinedRoutes,
        },
      ]),
    [combinedRoutes, isDarkTheme, setIsDarkTheme, workspaceKey] /* eslint-disable-line react-hooks/exhaustive-deps */,
  );

  if (hashRouter) {
    return (
      <React.Suspense fallback={<LegacySkeleton />}>
        <RouterProvider router={hashRouter} />
      </React.Suspense>
    );
  }

  return (
    <HashRouter key={workspaceKey}>
      <WorkspaceAwareRootRoute
        key={workspaceKey}
        routes={combinedRoutes}
        isDarkTheme={isDarkTheme}
        setIsDarkTheme={setIsDarkTheme}
      />
    </HashRouter>
  );
};
