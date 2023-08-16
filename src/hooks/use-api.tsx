import useSWR, { SWRConfiguration } from 'swr';

import { AllowedQueryKeys, HttpResponse } from '../services/services.types';

interface UseAPIArgs<T extends Object> {
  id: string;
  fetcher: (params?: AllowedQueryKeys) => Promise<HttpResponse<T>>;
  fetcherParams?: AllowedQueryKeys;
  config?: SWRConfiguration;
}

export default function useAPI<T extends Object>({
  id,
  config,
  fetcher,
  fetcherParams,
}: UseAPIArgs<T>) {
  const { error, data, mutate, isValidating } = useSWR<HttpResponse<T>>(
    id,
    () => fetcher(fetcherParams),
    config
  );
  return {
    loading: !data && !error,
    error,
    data: data?.data,
    response: data,
    mutate,
    isValidating,
  };
}
