import { Skeleton, Tbody, Td, Tr } from '@chakra-ui/react';
import { FC } from 'react';
import { v4 as uuid } from 'uuid';

export const TableLoadingViewRow: FC<{ numberOfColumns: number }> = ({
  numberOfColumns,
}) => (
  <Tr>
    {Array.from(Array(numberOfColumns).keys()).map(() => (
      <Td key={uuid()}>
        <Skeleton height="32px" />
      </Td>
    ))}
  </Tr>
);

export const TableLoadingView: FC<{
  numberOfColumns: number;
  numberOfLines: number;
}> = ({ numberOfColumns, numberOfLines }) => (
  <Tbody borderTop="2px solid rgba(0, 0, 0, 0.17)">
    {Array.from(Array(numberOfLines).keys()).map(() => (
      <TableLoadingViewRow key={uuid()} numberOfColumns={numberOfColumns} />
    ))}
  </Tbody>
);
