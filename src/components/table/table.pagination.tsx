import { Button, ButtonGroup, IconButton } from '@chakra-ui/button';
import { Text } from '@chakra-ui/layout';
import { Select } from '@chakra-ui/select';
import { FC, useCallback, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface TablePaginationProps {
  totalCount: number;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

const TablePagination: FC<TablePaginationProps> = ({
  totalCount,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const handleOnPageChange = useCallback(
    (page: number) => {
      const sanitizedPage = Math.max(0, Math.min(totalCount, page));
      if (currentPage !== sanitizedPage) onPageChange(sanitizedPage);
    },
    [currentPage, onPageChange, totalCount]
  );

  const handleOnRowsPerPageChange = useCallback(
    (total: string) => {
      const rowsToPresent = Number(total);
      onRowsPerPageChange(rowsToPresent);
    },
    [onRowsPerPageChange]
  );

  const shortcutButtonsCount = useMemo(() => {
    if (totalCount > 10) {
      return 3;
    }

    return totalCount;
  }, [totalCount]);

  return (
    <>
      <ButtonGroup mt={4} size="md" isAttached variant="outline">
        <IconButton
          aria-label="Go backward"
          icon={<FaChevronLeft fontSize="12px" fontWeight="bold" />}
          onClick={() => handleOnPageChange(currentPage - 1)}
        />
        {Array.from(Array(shortcutButtonsCount).keys())
          .map((p) => p + Math.max(0, currentPage - 2))
          .map((pageNumber) => {
            return (
              <Button
                key={String(pageNumber)}
                bgColor={pageNumber === currentPage ? '#E2E8F0' : 'transparent'}
                {...(pageNumber === currentPage && {
                  _hover: { bgColor: '#E2E8F0' },
                })}
                onClick={() => handleOnPageChange(pageNumber)}
              >
                {pageNumber + 1}
              </Button>
            );
          })}

        {shortcutButtonsCount !== totalCount && (
          <>
            <Button disabled={true} _hover={{ bgColor: 'transparent' }}>
              <Text opacity={0.4}>...</Text>
            </Button>
            <Button>{totalCount}</Button>
          </>
        )}

        <IconButton
          aria-label="Go forward"
          icon={<FaChevronRight fontSize="12px" fontWeight="bold" />}
          onClick={() => handleOnPageChange(currentPage + 1)}
        />
      </ButtonGroup>
      <ButtonGroup ml={4} mt={4} size="md" isAttached variant="outline">
        <Select
          value={String(rowsPerPage)}
          onChange={(event) => handleOnRowsPerPageChange(event.target.value)}
        >
          {[7, 10, 15, 25].map((rowCount) => (
            <option key={String(rowCount)} value={String(rowCount)}>
              {rowCount}
            </option>
          ))}
        </Select>
      </ButtonGroup>
    </>
  );
};

export default TablePagination;
