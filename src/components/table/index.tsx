import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  Flex,
  IconButton,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr,
  useToast,
} from '@chakra-ui/react';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import { useDebounce } from 'use-debounce';
import { v4 as uuid } from 'uuid';

import useAPI, { UseAPIArgs } from '@/hooks/use-api';
import useIsMounted from '@/hooks/use-is-mounted';
import { HttpResponse, ListDataResponse } from '@/services/services.types';
import theme from '@/styles/theme';
import { Entity } from '@/types';

import TableHead from './table.head';
import { TableLoadingView } from './table.loading-view';
import TablePagination from './table.pagination';
import { CustomCellsViewProps, TableComponentProps } from './table.types';

const NextPageLoader: FC<UseAPIArgs<Object>> = (props) => {
  const {} = useAPI(props);
  return null;
};

const TableComponent: FC<TableComponentProps> = ({
  tableId,
  fetcher,
  dataset,
  dataModifier,
  tableActions = {},
  customCellsView = {},
  customSearchComponent: CustomSearchComponent,
  genericSearchParams,
  addRecordLabel,
  localPagination = false,
  localSearchKeys = [],
  onActionClick,
  onEditButtonClick,
  onAddRecordButtonClick,
  onShowDetailsButtonClick,
  checkable = false,
  revalidate = true,
  onCheckButtonClick,
  checkButtonActionLabel,
}) => {
  const toast = useToast();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);

  const [localPage, setLocalPage] = useState(0);
  const [localRowsPerPage, setLocalRowsPerPage] = useState(7);
  const [localSearchData, setLocalSearchData] = useState<
    ListDataResponse<ReadonlyArray<Entity>>
  >({ data: [] } as any); // TODO: resolve that any

  const [searchLoading, setSearchLoading] = useState(false);
  const [searchData, setSearchData] = useState<
    ListDataResponse<ReadonlyArray<Entity>>
  >({ data: [] } as any); // TODO: resolve that any
  const [searchTotalCount, setSearchTotalCount] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState<Record<string, any>>({});
  const [debouncedSearchData] = useDebounce(searchQuery, 300);

  const isMounted = useIsMounted();

  const selectedRows: Array<Entity> = [];
  const [selectedEntities, setSelectedEntities] = useState<
    ReadonlyArray<Entity>
  >([]);

  const nextPageLoaderProsp = {
    id: `load-all-${tableId}?page=${page + 1}&ItemsPerPage=${rowsPerPage}`,
    fetcher: fetcher as any,
    fetcherParams: {
      page: page + 2,
      ItemsPerPage: rowsPerPage,
    },
    config: {
      revalidateOnFocus: revalidate,
      revalidateIfStale: revalidate,
      revalidateOnReconnect: revalidate,
    },
  };

  const {
    data,
    error,
    loading: isFetching,
    mutate,
  } = useAPI<ListDataResponse<ReadonlyArray<Entity>>>({
    id: `load-all-${tableId}?page=${page}&ItemsPerPage=${rowsPerPage}`,
    fetcher: fetcher as any,
    fetcherParams: {
      page: page + 1,
      ItemsPerPage: rowsPerPage,
    },
    config: {
      revalidateOnFocus: revalidate,
      revalidateIfStale: revalidate,
      revalidateOnReconnect: revalidate,
    },
  });

  useEffect(() => {
    if (localPagination) {
      if (Object.keys(debouncedSearchData).length > 0 && isMounted.current) {
        const searchRepo = dataModifier
          ? dataModifier(data?.data || [])
          : data?.data || [];

        const response = searchRepo.filter((row) =>
          localSearchKeys.reduce((prev, current) => {
            const key = genericSearchParams ? genericSearchParams.key : '';
            return (
              prev ||
              row[current]
                .toLowerCase()
                .includes(debouncedSearchData[key].toLowerCase())
            );
          }, false)
        );

        setLocalSearchData({
          currentPage: localPage,
          data: response,
          last_page: 1,
          total: response.length,
          TotalPages: 1,
        });
      }

      return;
    }

    (async () => {
      if (Object.keys(debouncedSearchData).length > 0 && isMounted.current) {
        try {
          setSearchLoading(true);

          const {
            data: response,
          }: HttpResponse<ListDataResponse<ReadonlyArray<Entity>>> =
            await fetcher({
              ...debouncedSearchData,
            });
          if (isMounted.current && response) {
            setSearchData(response);
            setSearchTotalCount(response?.TotalPages);
          }
        } catch (errorCatch) {
          toast({
            title: 'Erro',
            description: 'Um erro aconteceu na requisição de pesquisa',
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        }
      } else if (isMounted.current) {
        setSearchData({ data: [], total: 0 } as any);
        setSearchTotalCount(null);
      }
      if (isMounted.current) setSearchLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchData, fetcher, dataModifier, isMounted]);

  const handleOnRowsPerPageChange = useCallback(
    (rowsCount: number) => {
      if (localPagination) setLocalRowsPerPage(rowsCount);
      else setRowsPerPage(rowsCount);
    },
    [localPagination]
  );

  const handlePageChange = useCallback(
    (rowsCount: number) => {
      if (localPagination) setLocalPage(rowsCount);
      else setPage(rowsCount);
    },
    [localPagination]
  );

  const onSelectRow = useCallback(
    (row: Entity) => {
      const selectedRowIndex = selectedEntities.findIndex(
        (entity) => entity['IdCartao'] === row['IdCartao']
      );

      if (selectedRowIndex < 0) setSelectedEntities([...selectedEntities, row]);
      else {
        setSelectedEntities(
          selectedEntities.filter(
            (_, currentEntityIndex) => currentEntityIndex !== selectedRowIndex
          )
        );
      }
    },
    [selectedEntities]
  );

  const isRowSelected = useCallback(
    (row: Entity) => {
      return selectedEntities.some(
        (entity) => entity['IdCartao'] === row['IdCartao']
      );
    },
    [selectedEntities]
  );

  if (error) {
    return (
      <Alert status="error" borderRadius={8}>
        <AlertIcon />
        <Box>
          <AlertTitle>Erro ao carregar os dados!</AlertTitle>
          <AlertDescription>
            Infelizmente ocorreu um erro na requisição, verifique por favor a
            sua ligação e volte a tentar.
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  const renderTableActionButtons = (
    modifiedData: readonly Entity[],
    row: Entity,
    rowIndex: number
  ) => {
    if (Object.keys(tableActions).length <= 0) return null;

    return (
      <Td>
        <Flex direction="row" alignItems="center" gap={2}>
          {onEditButtonClick && (
            <IconButton
              colorScheme="yellow"
              aria-label="Editar"
              icon={<FaEdit />}
              onClick={() => onEditButtonClick(row, mutate)}
            />
          )}

          {Object.keys(tableActions).map((actionKey) => {
            const Action = tableActions[actionKey];

            return (
              <div
                role="button"
                key={uuid()}
                onClick={() => {
                  if (onActionClick) {
                    onActionClick(
                      {
                        id: '',
                        row,
                        key: `load-all-${tableId}?page=${page}&ItemsPerPage=${rowsPerPage}`,
                      },
                      actionKey,
                      mutate
                    );
                  }
                }}
              >
                <Action
                  currentRowData={row}
                  currentRowIndex={rowIndex}
                  data={data?.data || []}
                  mutate={mutate}
                />
              </div>
            );
          })}
        </Flex>
      </Td>
    );
  };

  const shownData =
    Object.keys(debouncedSearchData).length > 0
      ? localPagination
        ? localSearchData.data
        : searchData.data
      : data?.data || [];

  const modifiedData = dataModifier ? dataModifier(shownData) : shownData;

  return (
    <>
      {/* always pre-fetch next page for performance increase */}
      {revalidate && <NextPageLoader {...nextPageLoaderProsp} />}
      <Box>
        <Flex
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={4}
        >
          {addRecordLabel !== undefined && (
            <Button
              pl={4}
              pr={4}
              variant="solid"
              bgColor={theme.colors.appRose}
              color="white"
              onClick={() => {
                if (onAddRecordButtonClick) onAddRecordButtonClick(mutate);
              }}
            >
              {addRecordLabel}
            </Button>
          )}

          {checkable && checkButtonActionLabel && (
            <Button
              pl={4}
              pr={4}
              variant="solid"
              bgColor={theme.colors.appRose}
              color="white"
              opacity={selectedEntities.length > 0 ? 1 : 0.5}
              onClick={() => {
                if (onCheckButtonClick && selectedEntities.length > 0)
                  onCheckButtonClick(selectedRows);
              }}
            >
              {checkButtonActionLabel}
            </Button>
          )}

          <Flex direction="row" alignItems="center" gap={3}>
            {CustomSearchComponent && (
              <CustomSearchComponent
                onSearchSubmit={(filters) => {
                  setSearchQuery({ ...filters, ItemsPerPage: rowsPerPage });
                }}
              />
            )}

            {genericSearchParams && (
              <Flex direction="row" alignItems="center" gap={3}>
                <form
                  style={{
                    display: 'flex',
                    gap: '10px',
                  }}
                  onSubmit={(event) => {
                    event.preventDefault();

                    const key = genericSearchParams.key;
                    const formValues = event.target[
                      key as keyof typeof event.target
                    ] as any;

                    setSearchQuery({ ...searchQuery, [key]: formValues.value });
                  }}
                >
                  <Input
                    type="search"
                    name={genericSearchParams.key}
                    minWidth="300px"
                    placeholder="Pesquisar"
                    onChange={(event) => {
                      const key = genericSearchParams.key;

                      setSearchQuery({
                        ...searchQuery,
                        [key]: event.target.value,
                      });
                    }}
                  />
                  <Button
                    pl={8}
                    pr={8}
                    variant="solid"
                    colorScheme="main"
                    bgColor={theme.colors.appRose}
                    color="white"
                    type="submit"
                  >
                    {genericSearchParams.label}
                  </Button>
                </form>
              </Flex>
            )}
          </Flex>
        </Flex>
        <TableContainer
          borderWidth={1}
          borderRadius={8}
          maxHeight="700px"
          overflowY="scroll"
        >
          <Table variant={isFetching ? 'simple' : 'striped'}>
            <TableHead
              dataset={dataset}
              tableActions={tableActions}
              checkable={checkable}
            />
            {isFetching || searchLoading ? (
              <TableLoadingView
                numberOfColumns={dataset.length + 1}
                numberOfLines={7}
              />
            ) : (
              <>
                <Tbody borderTop="2px solid rgba(0, 0, 0, 0.17)">
                  {(localPagination
                    ? modifiedData.slice(
                        localPage * localRowsPerPage,
                        localPage * localRowsPerPage + localRowsPerPage
                      )
                    : modifiedData
                  ).map((row, rowIndex) => (
                    <Tr
                      key={uuid()}
                      role="button"
                      cursor={onShowDetailsButtonClick ? 'pointer' : 'default'}
                      onClick={() => {
                        if (onShowDetailsButtonClick)
                          onShowDetailsButtonClick(shownData[rowIndex]);
                      }}
                    >
                      {checkable && (
                        <Td>
                          <Checkbox
                            defaultChecked={isRowSelected(row)}
                            onChange={() => onSelectRow(row)}
                            colorScheme="purple"
                          />
                        </Td>
                      )}
                      {dataset.map((cell) => (
                        <Td key={uuid()}>
                          {(() => {
                            if (
                              customCellsView[
                                cell.id as keyof typeof customCellsView
                              ]
                            ) {
                              const View = customCellsView[
                                cell.id as keyof typeof customCellsView
                              ] as FC<CustomCellsViewProps>;
                              return <View data={row[cell.id]} />;
                            }

                            return <>{row[cell.id]}</>;
                          })()}
                        </Td>
                      ))}

                      {renderTableActionButtons(modifiedData, row, rowIndex)}
                    </Tr>
                  ))}
                </Tbody>
              </>
            )}
          </Table>
        </TableContainer>
        {localPagination ? (
          <Flex direction="row" justifyContent="flex-end">
            <TablePagination
              currentPage={localPage}
              totalCount={Math.ceil(
                (localSearchData.data.length
                  ? localSearchData.data
                  : data?.data || []
                ).length / localRowsPerPage
              )}
              rowsPerPage={localRowsPerPage}
              onRowsPerPageChange={handleOnRowsPerPageChange}
              onPageChange={handlePageChange}
            />
          </Flex>
        ) : (
          <>
            {(!isFetching || !searchLoading) && (
              <Flex direction="row" justifyContent="flex-end">
                <TablePagination
                  currentPage={page}
                  totalCount={searchTotalCount || data?.TotalPages || 0}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleOnRowsPerPageChange}
                  onPageChange={handlePageChange}
                />
              </Flex>
            )}
          </>
        )}
      </Box>
    </>
  );
};

export default TableComponent;
