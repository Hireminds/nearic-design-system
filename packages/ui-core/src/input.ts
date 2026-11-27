import type { InputHTMLAttributes } from 'react';

export type LabeledInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> & {label: string};
