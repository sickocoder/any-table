import { Text, Th, Thead, Tr } from '@chakra-ui/react';
import { FC } from 'react';

import { TableHeadProps } from './table.types';

const TableHead: FC<TableHeadProps> = ({
  dataset,
  tableActions,
  checkable,
}) => (
  <Thead>
    <Tr>
      {checkable && <Th>#</Th>}
      {dataset.map((cell) => (
        <Th key={cell.id} pt={4} pb={4}>
          <Text fontSize="0.9rem">{cell.label}</Text>
        </Th>
      ))}
      {Object.keys(tableActions).length > 0 && (
        <Th>
          <Text fontSize="0.9rem">Opções</Text>
        </Th>
      )}
    </Tr>
  </Thead>
);

export default TableHead;
