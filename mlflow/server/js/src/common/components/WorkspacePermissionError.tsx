import { Component } from 'react';
import errorDefaultImg from '../static/default-error.svg';
import { FormattedMessage } from 'react-intl';
import type { DesignSystemHocProps } from '@databricks/design-system';
import { WithDesignSystemThemeHoc } from '@databricks/design-system';
import { WorkspaceSelector } from './WorkspaceSelector';

type WorkspacePermissionErrorImplProps = DesignSystemHocProps & {
  workspaceName: string;
};

class WorkspacePermissionErrorImpl extends Component<WorkspacePermissionErrorImplProps> {
  renderErrorMessage(workspaceName: string) {
    return (
      <FormattedMessage
        defaultMessage='Workspace "{workspaceName}" not found. Please select a different workspace below.'
        description="Workspace not found error message for workspace selection in MLflow"
        values={{
          workspaceName: workspaceName,
        }}
      />
    );
  }

  render() {
    const { workspaceName, designSystemThemeApi } = this.props;

    return (
      <div className="mlflow-center">
        <img
          className="mlflow-center"
          alt="Workspace Not Found"
          src={errorDefaultImg}
          style={{
            margin: '12% auto 60px',
            display: 'block',
          }}
        />
        <h1 style={{ paddingTop: '10px' }}>Workspace Not Found</h1>
        <h2 style={{ color: designSystemThemeApi.theme.colors.textSecondary }}>
          {this.renderErrorMessage(workspaceName)}
        </h2>
        <div style={{ marginTop: designSystemThemeApi.theme.spacing.md }}>
          <WorkspaceSelector />
        </div>
      </div>
    );
  }
}

export const WorkspacePermissionError = WithDesignSystemThemeHoc(WorkspacePermissionErrorImpl);

