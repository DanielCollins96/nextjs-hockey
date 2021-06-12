import { useTable, useSortBy,useFilters } from 'react-table'

export default function ReactTable({ columns, data }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy
  )

  // Render the UI for your table
  return (
    <table {...getTableProps()} className="border border-black table-fixed p-4 text-sm ">
      <thead className="bg-blue-200">
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th className="p-1"{...column.getHeaderProps(column.getSortByToggleProps())}>{column.render('Header')}
              <span>
                {column.isSorted
                  ? column.isSortedDesc
                    ? ' 🔽'
                    : ' 🔼'
                  : ''}
              </span>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()} className="">
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td className="border-black border p-1" {...cell.getCellProps()}>{cell.render('Cell')}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}



