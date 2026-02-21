// import {useTable, useSortBy, useFilters} from "react-table";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {useState} from "react";
import Filter from "./Filter";

export default function ReactTable({
  columns,
  data,
  sortKey = "season",
  filterCol = ["fullName"],
  pageSize = 25,
}) {
  const [sorting, setSorting] = useState([
    {
      id: sortKey,
      desc: true,
    },
  ]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize,
  });

  const table = useReactTable({
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
  });

  return (
    <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <table className="border border-black p-2 m-1">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th className="" key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <span className="text-xs align-middle opacity-70 ml-1">
                          {{
                            asc: "▲",
                            desc: "▼",
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
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="">
          {table.getRowModel().rows?.map((row, i) => {
            const isNHL =
              row?.original["league.name"] == "National Hockey League" ||
              row?.original["league.name"] == "NHL";
            return (
              <tr key={row.id} className={isNHL ? "bg-slate-200" : ""}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td
                      className="border-black border px-1 text-sm whitespace-nowrap"
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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
      <div className="flex items-center gap-2 mt-2">
        <button
          className="px-3 py-1 rounded border transition
              text-black bg-gray-100 border-gray-300 hover:bg-gray-200
              dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700
              disabled:cursor-not-allowed disabled:opacity-60
              disabled:bg-gray-100 disabled:text-gray-400
              dark:disabled:bg-slate-900 dark:disabled:text-slate-600"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          className="px-3 py-1 rounded border transition
              text-black bg-gray-100 border-gray-300 hover:bg-gray-200
              dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700
              disabled:cursor-not-allowed disabled:opacity-60
              disabled:bg-gray-100 disabled:text-gray-400
              dark:disabled:bg-slate-900 dark:disabled:text-slate-600"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          className="px-3 py-1 rounded border transition
              text-black bg-gray-100 border-gray-300 hover:bg-gray-200
              dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700
              disabled:cursor-not-allowed disabled:opacity-60
              disabled:bg-gray-100 disabled:text-gray-400
              dark:disabled:bg-slate-900 dark:disabled:text-slate-600"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          className="px-3 py-1 rounded border transition
              text-black bg-gray-100 border-gray-300 hover:bg-gray-200
              dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700
              disabled:cursor-not-allowed disabled:opacity-60
              disabled:bg-gray-100 disabled:text-gray-400
              dark:disabled:bg-slate-900 dark:disabled:text-slate-600"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        {/* <div>{table.getRowModel().rows.length} Rows</div> */}
      </div>
    </div>
  );
}
