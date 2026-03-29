import {
  caronaTypeDisplayLabel,
  caronaTypeTagClass,
  parseCaronaType,
} from './carona-type.model';

describe('carona-type.model', () => {
  it('parseCaronaType accepts PascalCase and lowercase', () => {
    expect(parseCaronaType('Filantropica')).toBe('Filantropica');
    expect(parseCaronaType('filantropica')).toBe('Filantropica');
    expect(parseCaronaType('Igualitaria')).toBe('Igualitaria');
    expect(parseCaronaType('igualitaria')).toBe('Igualitaria');
    expect(parseCaronaType(' inválido ')).toBeNull();
    expect(parseCaronaType(null)).toBeNull();
  });

  it('caronaTypeDisplayLabel returns Portuguese UI labels', () => {
    expect(caronaTypeDisplayLabel('Filantropica')).toBe('Filantrópica');
    expect(caronaTypeDisplayLabel('igualitaria')).toBe('Igualitária');
  });

  it('caronaTypeTagClass returns expected CSS classes', () => {
    expect(caronaTypeTagClass('Filantropica')).toBe('tag verde');
    expect(caronaTypeTagClass('Igualitaria')).toBe('tag marrom');
    expect(caronaTypeTagClass('desconhecido')).toBe('tag');
  });
});
