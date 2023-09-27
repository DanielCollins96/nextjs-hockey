// import {useTable, useSortBy, useFilters} from "react-table";
import {
  useReactTable,
  flexRender,
  getRowModel,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel

} from "@tanstack/react-table";
import { useState } from "react";
import Filter from "./Filter";

export default function ReactTable({columns, data, sortKey = "season", filterCol=['fullName'], pageSize=25}) {

  const [sorting, setSorting] = useState([{
            id: sortKey,
            desc: true,
          },]);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: pageSize,
    })

  const table = useReactTable(
    {
      columns,
      data,
      state: {
      sorting,
      pagination,
      },
      onPaginationChange: setPagination,
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
    }
  );

  return (<>
    <table
      className="border border-black p-2 m-1 max-w-xl"
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
                        <span className="text-sm">
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted()] ?? null}
                        </span>
                      </div>
                    )}
                              {filterCol && filterCol.includes(header.column.id) && (
                        <div>
                        <Filter column={header.column} table={table} />
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
            <tr key={row.id} className={isNHL ? "bg-slate-200" : ""}>
              {row.getVisibleCells().map((cell) => {
                return (
                  <td
                    className="border-black border px-1"
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
    <div className="flex items-center gap-2">
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
                <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </strong>
        </span>
              {/* <div>{table.getRowModel().rows.length} Rows</div> */}

        </div>
        </>
  );
}
