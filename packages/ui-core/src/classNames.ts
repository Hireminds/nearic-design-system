export function classNames(...names: (string | undefined)[]) {
  return names.filter(Boolean).join(' ');
}
