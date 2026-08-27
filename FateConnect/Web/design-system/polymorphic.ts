import type { ComponentType, ElementType } from 'react';
import Box, { type BoxProps } from '@mui/material/Box';
import Stack, { type StackProps } from '@mui/material/Stack';

type Polymorphic<TargetProps> = { component?: ElementType } & TargetProps;

/**
 * `Box` e `Stack` aceitam `component`, mas o `styled` do Emotion resolve as props
 * pela última assinatura de chamada delas, onde a prop não aparece — e some da
 * tipagem. Estes alvos declaram o que já é verdade, então `styled(PolymorphicBox)`
 * dispensa a anotação no ponto de uso.
 *
 * ⛔ Não estenda a lista para alvo que **não** aceita `component`. O
 * `AccordionDetails`, por exemplo, é função simples: prometer a prop ali a faria
 * chegar ao DOM como atributo cru, perdendo a semântica em silêncio.
 */
export const PolymorphicBox: ComponentType<Polymorphic<BoxProps>> = Box;
export const PolymorphicStack: ComponentType<Polymorphic<StackProps>> = Stack;
