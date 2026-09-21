import { Children, Fragment, isValidElement, type ReactNode } from 'react';

const NO_FIELDS = 0;
const ONE_FIELD = 1;

/**
 * ⛔ Desce nos fragmentos: `Children.count` os conta como **um** filho, e quem
 * agrupa os campos num `<>…</>` receberia o diálogo estreito com vários campos.
 */
export function countFields(children: ReactNode): number {
  return Children.toArray(children).reduce<number>((total, child) => {
    if (isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment)
      return total + countFields(child.props.children);

    return total + ONE_FIELD;
  }, NO_FIELDS);
}
