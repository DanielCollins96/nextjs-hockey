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
          },]);

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
      // getPaginationRowModel: getPaginationRowModel(),
    }
  );

  return (
    <table
      className="border border-black px-1 m-1 "
    >
   <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <th className="px-1 whitespace-nowrap bg-white border border-blue-600" key={header.id} colSpan={header.colSpan}>
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
                        <span className="text-sm">
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
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
        {table.getRowModel().rows?.map((row, i) => {

          const isNHL = row?.original['league.name'] == 'National Hockey League'

          return (
            <tr key={row.id} className={`whitespace-nowrap ` + (isNHL ? "bg-slate-200" : "")}>
              {row.getVisibleCells().map((cell) => {
                return (
                  <td
                    className="border-black border px-1 text-sm"
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
        {table.getFooterGroups().map((footerGroup, idx) => (
          <tr
            key={footerGroup.id}
            className="bg-slate-300 py-px text-center font-bold"
          >
            {footerGroup.headers.map((header) => (
              <td
                key={header.id}
                colSpan={header.colSpan}
                className="border-black"
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
