import '@testing-library/jest-dom/vitest';

process.env.TZ = 'America/Sao_Paulo';

// jsdom não implementa scrollIntoView; os testes que precisam observam por spy.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}

// jsdom não implementa scrollTo; o ScrollRestoration do roteador o chama a cada navegação.
window.scrollTo = () => {};
