import { keys } from '@material-ui/core/styles/createBreakpoints'
import { useTable, useSortBy,useFilters } from 'react-table'

export default function ReactTable({ columns, data }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    footerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      initialState: {
        sortBy: [
          {
            id: 'season',
            desc: true,
          },
        ]
      }
    },
    useSortBy
  )

  // Render the UI for your table
  return (
    <table
      {...getTableProps()}
      className="border border-black table-fixed p-4 text-sm m-1"
    >
      <thead className="bg-blue-200">
        {headerGroups.map((headerGroup) => {
          const { key, ...restHeaderGroupProps } =
            headerGroup.getHeaderGroupProps();
          return (
            <tr key={key} {...restHeaderGroupProps}>
              {headerGroup.headers.map((column) => {
                const { key, ...restColumnProps } = column.getHeaderProps(
                  column.getSortByToggleProps()
                );
                return (
                  <th className="p-1" key={key} {...restColumnProps}>
                    {column.render("Header")}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? " 🔽"
                          : " 🔼"
                        : ""}
                    </span>
                  </th>
                );
              })}
            </tr>
          );
        })}
      </thead>
      <tbody {...getTableBodyProps()} className="">
        {rows.map((row, i) => {
          prepareRow(row);
          const { key, ...restRowProps } = row.getRowProps();
          return (
            <tr key={key} {...restRowProps} className="odd:bg-slate-200">
              {row.cells.map((cell) => {
                const { key, ...restCellProps } = cell.getCellProps();
                return (
                  <td
                    className="border-black border p-1"
                    key={key}
                    {...restCellProps}
                  >
                    {cell.render("Cell")}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        {footerGroups.map((group, idx) => (
          <tr key={idx} {...group.getFooterGroupProps()} className="bg-slate-300 py-px text-center font-bold">
            {group.headers.map((column) => (
              <td key={idx}{...column.getFooterProps()} className="border-black px-1">{column.render("Footer")}</td>
            ))}
          </tr>
        ))}
      </tfoot>
    </table>
  );
}



