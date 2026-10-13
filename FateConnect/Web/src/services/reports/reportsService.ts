import { apiClient } from '../httpClient';
import type { PagedResult } from '../types';
import type { Report, ReportFilter, ReportInput, ReportStatusEnum } from './types';

const REPORTS_PATH = '/reports';

const MY_REPORTS_PATH = `${REPORTS_PATH}/mine`;

const INVALID_LIST_PAYLOAD_MESSAGE = 'A API de denúncias respondeu algo que não é uma página.';

/** Registrar é `multipart`: é o que faz a foto viajar no mesmo pedido. */
function toFormData(input: ReportInput): FormData {
  const body = new FormData();

  body.append('Category', input.category);
  body.append('Description', input.description);
  body.append('IsAnonymous', String(input.isAnonymous));
  if (input.image) body.append('Image', input.image);

  return body;
}

async function listFrom(path: string, filters?: ReportFilter): Promise<PagedResult<Report>> {
  const { data } = await apiClient.get<PagedResult<Report>>(path, { params: filters });

  // Sem endereço de API a requisição cai no dev server, que responde HTML com 200.
  if (!Array.isArray(data?.items)) throw new Error(INVALID_LIST_PAYLOAD_MESSAGE);

  return data;
}

/** A listagem de todas, que a API abre só a quem administra. */
export async function listReports(filters?: ReportFilter): Promise<PagedResult<Report>> {
  return listFrom(REPORTS_PATH, filters);
}

/** O recorte é a rota, não o perfil de quem pede: `/mine` traz o que a pessoa enviou. */
export async function listMyReports(filters?: ReportFilter): Promise<PagedResult<Report>> {
  return listFrom(MY_REPORTS_PATH, filters);
}

/** A API recusa par inválido com 400, mas a tela não deve chegar a pedi-lo. */
export async function updateReportStatus(
  reportId: string,
  status: ReportStatusEnum,
): Promise<void> {
  await apiClient.patch(`${REPORTS_PATH}/${reportId}/status`, { Status: status });
}

export async function createReport(input: ReportInput): Promise<Report> {
  const { data } = await apiClient.post<Report>(REPORTS_PATH, toFormData(input));

  return data;
}
