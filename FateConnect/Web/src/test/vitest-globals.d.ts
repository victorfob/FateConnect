import type { Mock as VitestMock } from 'vitest';

/**
 * O `vitest/globals` declara só os **valores** — `describe`, `it`, `expect`,
 * `vi` e afins. Tipo fica de fora, então `Mock` exigiria um `import type` em
 * cada arquivo que tipa mock. Esta declaração fecha essa lacuna.
 *
 * A genérica não é repassada de propósito: as restrições dela (`Procedure` e
 * `Constructable`) não são exportadas por `vitest`, e o repo usa sempre a forma
 * sem argumento — `const mockUseXyz = useXyz as Mock`. Quem precisar de
 * `Mock<Fn>` importa o tipo naquele arquivo.
 */
declare global {
  type Mock = VitestMock;
}
