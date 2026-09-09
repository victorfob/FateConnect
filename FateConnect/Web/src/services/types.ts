export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

/** Como a API descreve quem a tela precisa contatar, em qualquer módulo. */
export type UserContact = { name: string; email: string; phone: string };

export type PageQuery = {
  page?: number;
  pageSize?: number;
};
