import { create } from 'storybook/theming/create';
import tokens from '@nearic/ui-box/tokens.json';

const { colors } = tokens;

export const darkTheme = create({
  base: 'dark',
  appBg: colors.surface,
  appContentBg: colors.canvas,
  appPreviewBg: colors.canvas,
  appBorderColor: colors.line,
  appHoverBg: colors.action,
  textColor: colors.text,
  textMutedColor: colors.muted,
  textInverseColor: colors['on-accent'],
  colorPrimary: colors.focus,
  colorSecondary: colors.accent,
  barBg: colors.surface,
  barTextColor: colors.muted,
  barHoverColor: colors.focus,
  barSelectedColor: colors.accent,
  inputBg: colors.surface,
  inputBorder: colors.track,
  inputTextColor: colors.text,
  buttonBg: colors.action,
  buttonBorder: colors.track,
  booleanBg: colors.surface,
  booleanSelectedBg: colors.control,
});
