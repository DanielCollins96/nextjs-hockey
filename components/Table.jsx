// import {useTable, useSortBy, useFilters} from "react-table";
import {
  useReactTable,
  flexRender,
  getRowModel,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState

} from "@tanstack/react-table";
import { useState } from "react";

export default function ReactTable({columns, data, sortKey = "season"}) {

  const [sorting, setSorting] = useState([{
            id: sortKey,
            desc: true,
          },])

  const table = useReactTable(
    {
      columns,
      data,
      state: {
      sorting,
      },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      // sortingFns: {

      // }
      // initialState: {
      //   sortBy: [
      //     {
      //       id: sortKey,
      //       desc: true,
      //     },
      //   ],
      // },
    }
    // useSortBy
  );

  // Render the UI for your table
  return (
    <table
      // {...getTableProps()}
      className="border border-black table-fixed p-4 text-sm m-1 max-w-xl"
    >
   <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <th className="p-1" key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : '',
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted()] ?? null}
                      </div>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
      <tbody className="">
        {table.getRowModel().rows?.map((row, i) => {
          // prepareRow(row);
          // const {key, ...restRowProps} = row.getRowProps();
          return (
            <tr key={row.id} className="odd:bg-slate-200">
              {row.getVisibleCells().map((cell) => {
                // const {key, ...restCellProps} = cell.getCellProps();
                return (
                  <td
                    className="border-black border p-1"
                    key={cell.id}
                    // {...restCellProps}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        {table.getFooterGroups().map((footerGroup, idx) => (
          <tr
            key={footerGroup.id}
            // {...group.getFooterGroupProps()}
            className="bg-slate-300 py-px text-center font-bold"
          >
            {footerGroup.headers.map((header) => (
              <td
                key={header.id}
                // {...column.getFooterProps()}
                colSpan={header.colSpan}
                className="border-black px-1"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.footer,
                      header.getContext()
                    )}{" "}
              </td>
            ))}
          </tr>
        ))}
      </tfoot>
    </table>
  );
}
