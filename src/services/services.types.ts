export type ApiRequestMethod = 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';

export interface HttpResponse<T extends Object> {
  status: number;
  errorMessage?: string;
  data?: T;
}

export interface ListDataResponse<T> {
  data: T;
  count: number;
}

export type AllowedQueryKeys = Record<string, string | number>;
