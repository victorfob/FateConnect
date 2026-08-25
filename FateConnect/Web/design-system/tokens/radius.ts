export type RadiusToken = 'none' | 'sm' | 'md' | 'component' | 'lg' | 'circle';

/** Raios em **pixels**. `component` é o raio padrão de card, campo e diálogo. */
export const radiusScale: Record<RadiusToken, number> = {
  none: 0,
  sm: 4,
  md: 8,
  component: 10,
  lg: 16,
  circle: 9999,
};
