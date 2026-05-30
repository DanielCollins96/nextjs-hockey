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
  initialSorting,
  filterCol = ["fullName"],
  pageSize = 25,
  modern = false,
}) {
  const [sorting, setSorting] = useState(
    initialSorting || [
      {
        id: sortKey,
        desc: true,
      },
    ]
  );

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

  const getColumnWidth = (column) => {
    const width = column.columnDef.size;

    return width ? `${width}px` : undefined;
  };

  const paginationButtonClass = modern
    ? "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-blue-500 dark:hover:bg-slate-700 dark:disabled:hover:border-slate-700 dark:disabled:hover:bg-slate-800 dark:disabled:hover:text-slate-100"
    : "px-3 py-1 rounded border transition text-black bg-gray-100 border-gray-300 hover:bg-gray-200 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-slate-900 dark:disabled:text-slate-600";

  return (
    <div>
      <div className={`relative overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${modern ? "rounded-lg border border-slate-200 dark:border-slate-700" : ""}`}>
        <table className={modern ? "w-max table-fixed border-collapse text-sm" : "border border-black p-2 m-1"}>
        {modern && (
          <colgroup>
            {table.getAllLeafColumns().map((column) => (
              <col key={column.id} style={{ width: getColumnWidth(column) }} />
            ))}
          </colgroup>
        )}
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const headerClassName = header.column.columnDef.meta?.headerClassName || "";
                const isRightAligned = headerClassName.includes("text-right");

                return (
                  <th
                    className={
                      modern
                        ? `border-b border-slate-200 bg-slate-50 px-2 py-2 text-left text-xs font-semibold uppercase text-slate-600 first:rounded-tl-lg last:rounded-tr-lg dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 whitespace-nowrap ${headerClassName}`
                        : ""
                    }
                    key={header.id}
                    colSpan={header.colSpan}
                  >
                    <div className={`flex items-center gap-1 ${isRightAligned ? "justify-end" : "justify-between"}`}>
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
                    </div>
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
              <tr
                key={row.id}
                className={
                  modern
                    ? "whitespace-nowrap bg-white odd:bg-white even:bg-slate-50 hover:bg-blue-50 dark:bg-slate-900 dark:odd:bg-slate-900 dark:even:bg-slate-800/70 dark:hover:bg-slate-800"
                    : isNHL ? "bg-slate-200" : ""
                }
              >
                {row.getVisibleCells().map((cell) => {
                  const cellClassName = cell.column.columnDef.meta?.cellClassName || "";

                  return (
                    <td
                      className={
                        modern
                          ? `border-b border-slate-200 px-2 py-1.5 text-slate-800 dark:border-slate-700 dark:text-slate-100 whitespace-nowrap overflow-hidden text-ellipsis ${cellClassName}`
                          : "border-black border px-1 text-sm whitespace-nowrap"
                      }
                      key={cell.id}
                      title={modern ? String(cell.getValue() ?? "") : undefined}
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
              className={
                modern
                  ? "bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  : "bg-slate-300 py-px text-center font-bold"
              }
            >
              {footerGroup.headers.map((header) => (
                <td
                  key={header.id}
                  colSpan={header.colSpan}
                  className={modern ? "px-2 py-2 whitespace-nowrap" : "border-black px-1"}
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
        <div className={modern ? "flex flex-wrap items-center gap-2 border-t border-slate-200 bg-slate-50 px-2 py-2 dark:border-slate-700 dark:bg-slate-900" : "flex items-center gap-2 mt-2"}>
        <button
          className={paginationButtonClass}
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          className={paginationButtonClass}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          className={paginationButtonClass}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          className={paginationButtonClass}
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>
        <span className={modern ? "ml-auto flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300" : "flex items-center gap-1"}>
          <span>Page</span>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        {/* <div>{table.getRowModel().rows.length} Rows</div> */}
        </div>
      </div>
    </div>
  );
}
