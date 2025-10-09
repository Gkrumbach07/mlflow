import type { ThemeType as Theme } from '@databricks/design-system';
import patternflyVariables from '@patternfly/react-tokens/dist/js/patternfly_variables';

type PatternFlyVariableMap = Record<string, Record<string, { name: string; value: string }>>;

const resolvePatternFlyRootTokens = (): Record<string, { name: string; value: string }> => {
  const variablesFromModule = (
    patternflyVariables as unknown as { patternfly_variables?: PatternFlyVariableMap }
  ).patternfly_variables;
  const variablesFromDefaultExport = (
    patternflyVariables as unknown as { default?: { patternfly_variables?: PatternFlyVariableMap } }
  ).default?.patternfly_variables;
  const tokenSource = variablesFromModule ?? variablesFromDefaultExport;

  return tokenSource?.[':root'] ?? {};
};

const pfTokens = resolvePatternFlyRootTokens();

const getTokenValue = (tokenName: string, fallback: string | number) => {
  const token = pfTokens[tokenName];
  if (!token || token.value === undefined || token.value === null) {
    return fallback;
  }
  return token.value;
};

const remToPx = (rem: string, fallback: number) => {
  if (!rem.endsWith('rem')) {
    return fallback;
  }
  const parsed = parseFloat(rem);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return parsed * 16;
};

const mapSpacing = (baseTheme: Theme) => ({
  ...baseTheme.spacing,
  xs: remToPx(getTokenValue('t_global_spacer_100', '0.25rem').toString(), baseTheme.spacing.xs),
  sm: remToPx(getTokenValue('t_global_spacer_200', '0.5rem').toString(), baseTheme.spacing.sm),
  md: remToPx(getTokenValue('t_global_spacer_300', '1rem').toString(), baseTheme.spacing.md),
  lg: remToPx(getTokenValue('t_global_spacer_400', '1.5rem').toString(), baseTheme.spacing.lg),
});

const mapTypography = (baseTheme: Theme) => ({
  ...baseTheme.typography,
  fontSizeSm: remToPx(
    getTokenValue('t_global_font_size_body_sm', '0.875rem').toString(),
    baseTheme.typography.fontSizeSm,
  ),
  fontSizeBase: remToPx(
    getTokenValue('t_global_font_size_body_default', '1rem').toString(),
    baseTheme.typography.fontSizeBase,
  ),
  fontSizeMd: remToPx(
    getTokenValue('t_global_font_size_body_default', '1rem').toString(),
    baseTheme.typography.fontSizeMd,
  ),
  fontSizeLg: remToPx(
    getTokenValue('t_global_font_size_heading_h3', '1.25rem').toString(),
    baseTheme.typography.fontSizeLg,
  ),
  fontSizeXl: remToPx(
    getTokenValue('t_global_font_size_heading_h2', '1.5rem').toString(),
    baseTheme.typography.fontSizeXl,
  ),
  fontSizeXxl: remToPx(
    getTokenValue('t_global_font_size_heading_h1', '2rem').toString(),
    baseTheme.typography.fontSizeXxl,
  ),
  typographyRegularFontWeight:
    parseFloat(
      getTokenValue('t_global_font_weight_body_legacy', `${baseTheme.typography.typographyRegularFontWeight}`).toString(),
    ) || baseTheme.typography.typographyRegularFontWeight,
  typographyBoldFontWeight:
    parseFloat(
      getTokenValue(
        't_global_font_weight_body_bold_legacy',
        `${baseTheme.typography.typographyBoldFontWeight}`,
      ).toString(),
    ) || baseTheme.typography.typographyBoldFontWeight,
});

const mapColors = (baseTheme: Theme, isDarkMode: boolean) => {
  const backgroundPrimaryToken = isDarkMode ? 't_global_background_color_450' : 't_global_background_color_100';
  const backgroundSecondaryToken = isDarkMode ? 't_global_background_color_400' : 't_global_background_color_200';

  return {
    ...baseTheme.colors,
    backgroundPrimary: getTokenValue(backgroundPrimaryToken, baseTheme.colors.backgroundPrimary) as string,
    backgroundSecondary: getTokenValue(backgroundSecondaryToken, baseTheme.colors.backgroundSecondary) as string,
    textPrimary: getTokenValue(
      isDarkMode ? 't_global_text_color_inverse' : 't_global_text_color_regular',
      baseTheme.colors.textPrimary,
    ) as string,
    textSecondary: getTokenValue('t_global_text_color_subtle', baseTheme.colors.textSecondary) as string,
    textPlaceholder: getTokenValue('t_global_text_color_placeholder', baseTheme.colors.textPlaceholder) as string,
    border: getTokenValue(
      isDarkMode ? 't_global_border_color_100' : 't_global_border_color_300',
      baseTheme.colors.border,
    ) as string,
    borderAccessible: getTokenValue('t_global_border_color_200', baseTheme.colors.borderAccessible) as string,
    actionPrimaryBackgroundDefault: getTokenValue(
      't_global_color_brand_default',
      baseTheme.colors.actionPrimaryBackgroundDefault,
    ) as string,
    actionPrimaryBackgroundHover: getTokenValue(
      't_global_color_brand_hover',
      baseTheme.colors.actionPrimaryBackgroundHover,
    ) as string,
    actionPrimaryBackgroundPress: getTokenValue(
      't_global_color_brand_clicked',
      baseTheme.colors.actionPrimaryBackgroundPress,
    ) as string,
    actionPrimaryTextDefault: getTokenValue(
      't_global_text_color_on_brand_default',
      baseTheme.colors.actionPrimaryTextDefault,
    ) as string,
    actionPrimaryTextHover: getTokenValue(
      't_global_text_color_on_brand_default',
      baseTheme.colors.actionPrimaryTextHover,
    ) as string,
    actionPrimaryTextPress: getTokenValue(
      't_global_text_color_on_brand_default',
      baseTheme.colors.actionPrimaryTextPress,
    ) as string,
    actionDefaultBackgroundDefault: getTokenValue(
      't_global_background_color_primary_default',
      baseTheme.colors.actionDefaultBackgroundDefault,
    ) as string,
    actionDefaultBackgroundHover: getTokenValue(
      't_global_background_color_action_plain_hover',
      baseTheme.colors.actionDefaultBackgroundHover,
    ) as string,
    actionDefaultBackgroundPress: getTokenValue(
      't_global_background_color_action_plain_clicked',
      baseTheme.colors.actionDefaultBackgroundPress,
    ) as string,
    actionDefaultBorderDefault: getTokenValue(
      't_global_border_color_default',
      baseTheme.colors.actionDefaultBorderDefault,
    ) as string,
    actionDefaultBorderHover: getTokenValue(
      't_global_color_brand_hover',
      baseTheme.colors.actionDefaultBorderHover,
    ) as string,
    actionDefaultBorderPress: getTokenValue(
      't_global_color_brand_clicked',
      baseTheme.colors.actionDefaultBorderPress,
    ) as string,
    actionDefaultTextDefault: getTokenValue('t_global_text_color_regular', baseTheme.colors.actionDefaultTextDefault) as string,
    actionDefaultTextHover: getTokenValue('t_global_color_brand_hover', baseTheme.colors.actionDefaultTextHover) as string,
    actionDefaultTextPress: getTokenValue('t_global_color_brand_clicked', baseTheme.colors.actionDefaultTextPress) as string,
    actionDefaultBorderFocus: getTokenValue('t_global_color_brand_default', baseTheme.colors.actionDefaultBorderFocus) as string,
    actionTertiaryBackgroundDefault: getTokenValue(
      't_global_background_color_primary_default',
      baseTheme.colors.actionTertiaryBackgroundDefault,
    ) as string,
    actionTertiaryBackgroundHover: getTokenValue(
      't_global_background_color_action_plain_hover',
      baseTheme.colors.actionTertiaryBackgroundHover,
    ) as string,
    actionTertiaryBackgroundPress: getTokenValue(
      't_global_background_color_action_plain_clicked',
      baseTheme.colors.actionTertiaryBackgroundPress,
    ) as string,
    actionTertiaryTextDefault: getTokenValue('t_global_color_brand_default', baseTheme.colors.actionTertiaryTextDefault) as string,
    actionTertiaryTextHover: getTokenValue('t_global_color_brand_hover', baseTheme.colors.actionTertiaryTextHover) as string,
    actionTertiaryTextPress: getTokenValue('t_global_color_brand_clicked', baseTheme.colors.actionTertiaryTextPress) as string,
    actionDisabledBorder: getTokenValue('t_global_border_color_200', baseTheme.colors.actionDisabledBorder) as string,
    actionDisabledText: getTokenValue('t_global_text_color_disabled', baseTheme.colors.actionDisabledText) as string,
    actionDangerPrimaryBackgroundDefault: getTokenValue(
      't_global_color_status_danger_default',
      baseTheme.colors.actionDangerPrimaryBackgroundDefault,
    ) as string,
    actionDangerPrimaryBackgroundHover: getTokenValue(
      't_global_color_status_danger_hover',
      baseTheme.colors.actionDangerPrimaryBackgroundHover,
    ) as string,
    actionDangerPrimaryBackgroundPress: getTokenValue(
      't_global_color_status_danger_clicked',
      baseTheme.colors.actionDangerPrimaryBackgroundPress,
    ) as string,
    actionDangerDefaultBackgroundDefault: getTokenValue(
      't_global_background_color_primary_default',
      baseTheme.colors.actionDangerDefaultBackgroundDefault,
    ) as string,
    actionDangerDefaultBackgroundHover: getTokenValue(
      't_global_background_color_action_plain_hover',
      baseTheme.colors.actionDangerDefaultBackgroundHover,
    ) as string,
    actionDangerDefaultBackgroundPress: getTokenValue(
      't_global_background_color_action_plain_clicked',
      baseTheme.colors.actionDangerDefaultBackgroundPress,
    ) as string,
    actionDangerDefaultBorderDefault: getTokenValue(
      't_global_color_status_danger_default',
      baseTheme.colors.actionDangerDefaultBorderDefault,
    ) as string,
    actionDangerDefaultBorderHover: getTokenValue(
      't_global_color_status_danger_hover',
      baseTheme.colors.actionDangerDefaultBorderHover,
    ) as string,
    actionDangerDefaultBorderPress: getTokenValue(
      't_global_color_status_danger_clicked',
      baseTheme.colors.actionDangerDefaultBorderPress,
    ) as string,
    actionDangerDefaultTextDefault: getTokenValue(
      't_global_color_status_danger_default',
      baseTheme.colors.actionDangerDefaultTextDefault,
    ) as string,
    actionDangerDefaultTextHover: getTokenValue(
      't_global_color_status_danger_hover',
      baseTheme.colors.actionDangerDefaultTextHover,
    ) as string,
    actionDangerDefaultTextPress: getTokenValue(
      't_global_color_status_danger_clicked',
      baseTheme.colors.actionDangerDefaultTextPress,
    ) as string,
  };
};

const mapShadows = (baseTheme: Theme) => ({
  ...baseTheme.shadows,
  sm: getTokenValue('t_global_box_shadow_sm', baseTheme.shadows.sm) as string,
  md: getTokenValue('t_global_box_shadow_md', baseTheme.shadows.md) as string,
  lg: getTokenValue('t_global_box_shadow_lg', baseTheme.shadows.lg) as string,
  xl: getTokenValue('t_global_box_shadow_lg', baseTheme.shadows.xl) as string,
});

const mapBorders = (baseTheme: Theme) => ({
  ...baseTheme.borders,
  borderRadiusSm:
    parseFloat(getTokenValue('t_global_border_radius_200', '4px').toString()) || baseTheme.borders.borderRadiusSm,
  borderRadiusMd:
    parseFloat(getTokenValue('t_global_border_radius_300', '6px').toString()) || baseTheme.borders.borderRadiusMd,
  borderRadiusLg:
    parseFloat(getTokenValue('t_global_border_radius_400', '8px').toString()) || baseTheme.borders.borderRadiusLg,
});

export const buildPatternFlyTheme = ({ baseTheme, isDarkMode }: { baseTheme: Theme; isDarkMode: boolean }): Theme => {
  return {
    ...baseTheme,
    spacing: mapSpacing(baseTheme),
    typography: mapTypography(baseTheme),
    colors: mapColors(baseTheme, isDarkMode),
    shadows: mapShadows(baseTheme),
    borders: mapBorders(baseTheme),
  };
};

