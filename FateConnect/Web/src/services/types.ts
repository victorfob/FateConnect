export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PageQuery = {
  page?: number;
  pageSize?: number;
};
