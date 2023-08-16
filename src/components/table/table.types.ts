import { FC } from 'react';
import { KeyedMutator } from 'swr';

import {
  AllowedQueryKeys,
  HttpResponse,
  ListDataResponse,
} from '@/services/services.types';
import { Entity } from '@/types';

export interface TTableDataset {
  id: string;
  label: string;
}

export type TTableActionButtons = Record<string, FC<TableOptionButtonProps>>;

export interface GenericSearchParams {
  key: string;
  label: string;
}

export type MutateFunction = (
  data: HttpResponse<ListDataResponse<readonly Entity[]>>
) => Promise<HttpResponse<ListDataResponse<readonly Entity[]>> | undefined>;

export type MutateFn = KeyedMutator<
  HttpResponse<ListDataResponse<readonly Entity[]>>
>;

export interface TableOptionButtonProps {
  data: ReadonlyArray<Entity>;
  currentRowData: Entity;
  currentRowIndex: number;
  mutate: MutateFunction;
}

export interface TableHeadProps {
  dataset: ReadonlyArray<TTableDataset>;
  tableActions: TTableActionButtons;
  checkable: boolean;
}

export interface CustomSearchComponentProps {
  onSearchSubmit: (searchData: Record<string, any>) => void;
}

export interface CustomCellsViewProps<T = object> {
  data: T;
}
export interface TableComponentProps {
  tableId: string;
  dataset: ReadonlyArray<TTableDataset>;
  searchParams?: AllowedQueryKeys;
  tableActions?: TTableActionButtons;
  customSearchComponent?: FC<CustomSearchComponentProps>;
  customCellsView?: Record<string, FC<CustomCellsViewProps>>;
  genericSearchParams?: GenericSearchParams;
  addRecordLabel?: string;
  onActionClick?: (
    entity: Entity,
    actionKey: string,
    mutate: KeyedMutator<HttpResponse<ListDataResponse<ReadonlyArray<Entity>>>>
  ) => void;
  onEditButtonClick?: (
    data: Entity,
    mutate: KeyedMutator<HttpResponse<ListDataResponse<ReadonlyArray<Entity>>>>
  ) => void;
  onShowDetailsButtonClick?: (record: Entity) => void;
  onAddRecordButtonClick?: (
    mutate: KeyedMutator<HttpResponse<ListDataResponse<ReadonlyArray<Entity>>>>
  ) => void;
  fetcher: (...args: any) => Promise<HttpResponse<ListDataResponse<any>>>;
  dataModifier?: (data: ReadonlyArray<Entity>) => ReadonlyArray<Entity>;
  localPagination?: boolean;
  localSearchKeys?: ReadonlyArray<string>;
  checkable?: boolean;
  revalidate?: boolean;
  onCheckButtonClick?: (checkedRows: ReadonlyArray<Entity>) => void;
  checkButtonActionLabel?: string;
}
