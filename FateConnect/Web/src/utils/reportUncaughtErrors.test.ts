import { reportUncaughtErrors } from './reportUncaughtErrors';

describe('reportUncaughtErrors', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    reportUncaughtErrors();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should report an error that escaped a listener', () => {
    const error = new Error('estourou fora do render');

    window.dispatchEvent(new ErrorEvent('error', { error, message: 'estourou fora do render' }));

    expect(console.error).toHaveBeenCalledWith('Erro não capturado:', error);
  });

  // Nem todo `ErrorEvent` carrega o objeto de erro — script de outra origem, por
  // exemplo, chega só com a mensagem.
  it('should fall back to the message when the event carries no error object', () => {
    window.dispatchEvent(new ErrorEvent('error', { message: 'script de outra origem' }));

    expect(console.error).toHaveBeenCalledWith('Erro não capturado:', 'script de outra origem');
  });

  it('should report a promise nobody handled', () => {
    const event = new Event('unhandledrejection');
    Object.defineProperty(event, 'reason', { value: 'promessa solta' });

    window.dispatchEvent(event);

    expect(console.error).toHaveBeenCalledWith(
      'Promessa rejeitada sem tratamento:',
      'promessa solta',
    );
  });
});
