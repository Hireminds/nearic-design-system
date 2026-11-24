import { iconNames, type ButtonVariant, type IconProps, type StatusIndicatorProps, type TextVariant, type Tone } from '@nearic/ui-box';

type Kind = 'boolean' | 'number' | 'string' | 'function' | 'other';

function prop(description: string, type: string, kind: Kind, required = false, initial?: string) {
  return {
    description,
    type: { name: kind, value: type, required },
    table: {
      type: { summary: type },
      ...(initial === undefined ? {} : { defaultValue: { summary: initial } }),
    },
  };
}

export function stringProp(description: string, required = false, initial?: string) {
  return { ...prop(description, 'string', 'string', required, initial), control: 'text' as const };
}
export function bool(description: string, initial?: string, required = false) {
  return { ...prop(description, 'boolean', 'boolean', required, initial), control: 'boolean' as const };
}
export function numeric(description: string, options: { required?: boolean; initial?: string; type?: string } = {}) {
  return { ...prop(description, options.type ?? 'number', 'number', options.required, options.initial), control: 'number' as const };
}
export function choice<T extends string>(options: readonly T[], description: string, initial?: T, required = false) {
  const union = options.map(value => "'" + value + "'").join(' | ');
  return {
    ...prop(description, union, 'string', required, initial),
    options: [...options], control: 'select' as const,
  };
}
export function callback(description: string, signature: string, required = false) {
  return { ...prop(description, signature, 'function', required), control: false as const };
}
export const children = {
  ...prop('Вложенное содержимое. Для текстового примера подпись можно изменить в Controls.', 'ReactNode', 'other'),
  control: 'text' as const,
};
export const className = stringProp('Дополнительный класс корневого элемента.');
export const disabled = bool('Отключает ввод, нажатия и переход к контролу по Tab.', 'false');
export const label = stringProp('Доступное имя, которое озвучивает программа чтения с экрана.', true);
export const onClick = callback('Срабатывает при активации мышью, касанием или клавиатурой.', 'MouseEventHandler<HTMLButtonElement>');
export const changeInput = callback('После изменения прочитайте новое значение из event.currentTarget.', 'ChangeEventHandler<HTMLInputElement>');
export const variantOptions = ['primary', 'secondary', 'quiet', 'destructive'] as const satisfies readonly ButtonVariant[];
export const variantProp = (initial: ButtonVariant) => choice(variantOptions, 'Визуальный приоритет действия.', initial);
export const buttonType = choice(['button', 'submit', 'reset'], 'Поведение кнопки внутри формы.', 'button');
export const symbol = choice(iconNames, 'Имя пиктограммы из экспорта iconNames.', undefined, true);
export const size = choice(['small', 'regular', 'large'] as const satisfies readonly NonNullable<IconProps['size']>[], 'Размер самой пиктограммы.', 'regular');
export const tone = choice(['inherit', 'neutral', 'network', 'sound', 'info', 'success', 'warning', 'error'] as const satisfies readonly Tone[], 'Цветовая роль пиктограммы.', 'inherit');
export const textVariant = choice(['body', 'heading', 'title', 'label', 'control'] as const satisfies readonly TextVariant[], 'Типографическая роль.', 'body');
export const statusTone = choice(['neutral', 'info', 'success', 'warning', 'error'] as const satisfies readonly NonNullable<StatusIndicatorProps['tone']>[], 'Смысл состояния. Передайте читаемое название в children.', 'neutral');
export function docs(description: string) {
  return { docs: { description: { component: description } } };
}
