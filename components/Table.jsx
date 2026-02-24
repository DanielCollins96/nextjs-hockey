// import {useTable, useSortBy, useFilters} from "react-table";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useState } from "react";

export default function ReactTable({columns, data, sortKey = "season", sortDesc = true, rowClassName, mobileFit = false}) {

  const [sorting, setSorting] = useState([{
            id: sortKey,
            desc: sortDesc,
          },]);

  const table = useReactTable(
    {
      columns,
      data,
      state: {
      sorting,
      },
      onSortingChange: setSorting,
      sortDescFirst: true,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      // getPaginationRowModel: getPaginationRowModel(),
    }
  );

  return (
    <div className="overflow-x-auto max-w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <table
        className={`${mobileFit ? "w-max m-0" : "m-1"} border border-black dark:border-gray-600 px-1`}
      >
     <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <th className={`${mobileFit ? "px-1 text-xs sm:text-sm whitespace-nowrap" : "px-1 whitespace-nowrap"} bg-white dark:bg-gray-800 dark:text-white border border-blue-600 dark:border-blue-500`} key={header.id} colSpan={header.colSpan}>
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
                        <span className="text-xs align-middle opacity-70 ml-1">
                        {{
                          asc: '▲',
                          desc: '▼',
                        }[header.column.getIsSorted()] ?? null}
                        </span>
                      </div>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
      <tbody className="">
        {table.getRowModel().rows?.map((row, i, allRows) => {

          const isNHL = row?.original['league.name'] == 'National Hockey League' || row?.original['league.name'] == 'NHL';
          const customRowClass = rowClassName ? rowClassName(row, i, allRows, sorting) : null;
          const defaultRowClass = isNHL ? "bg-slate-200 dark:bg-gray-700" : "dark:bg-gray-800";

          return (
            <tr key={row.id} className={`whitespace-nowrap ` + (customRowClass ?? defaultRowClass)}>
              {row.getVisibleCells().map((cell) => {
                return (
                  <td
                    className={`${mobileFit ? "px-1 text-xs sm:text-sm" : "px-1 text-sm"} border-black dark:border-gray-600 border dark:text-gray-200 whitespace-nowrap`}
                    key={cell.id}
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
        {table.getFooterGroups().map((footerGroup) => (
          <tr
            key={footerGroup.id}
            className={`${mobileFit ? "text-[10px] sm:text-xs font-semibold" : "text-xs font-semibold"} bg-slate-300 dark:bg-gray-700 py-px dark:text-white`}
          >
            {footerGroup.headers.map((header) => (
              <td
                key={header.id}
                colSpan={header.colSpan}
                className={`px-1 border-black whitespace-nowrap`}
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
    </div>
  );
}
