import { buildRouteErrorReport } from './buildRouteErrorReport';
import { ErrorTypeEnum } from './errorTypes';

const NOT_FOUND_STATUS = 404;

describe('buildRouteErrorReport', () => {
  it('should report the original error, preserving its stacktrace', () => {
    const original = new Error('a tela quebrou');

    const report = buildRouteErrorReport(original);

    // O mesmo objeto, não uma cópia: é o stacktrace dele que agrupa a issue.
    expect(report.error).toBe(original);
    expect(report.errorType).toBe(ErrorTypeEnum.ROUTE_BOUNDARY);
    expect(report.extra).toEqual({});
  });

  it('should tell a route response apart from a crash', () => {
    const report = buildRouteErrorReport({
      status: NOT_FOUND_STATUS,
      statusText: 'Not Found',
      data: null,
      internal: false,
    });

    expect(report.errorType).toBe(ErrorTypeEnum.ROUTE_ERROR_RESPONSE);
    expect(report.error.message).toContain('404');
    expect(report.extra).toEqual({ status: NOT_FOUND_STATUS, statusText: 'Not Found' });
  });

  it('should keep a non-serializable error reportable', () => {
    const report = buildRouteErrorReport('quebrou sem objeto de erro');

    expect(report.errorType).toBe(ErrorTypeEnum.ROUTE_BOUNDARY);
    expect(report.extra).toEqual({ routeError: 'quebrou sem objeto de erro' });
  });
});
