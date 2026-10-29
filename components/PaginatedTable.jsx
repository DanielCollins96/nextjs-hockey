// import {useTable, useSortBy, useFilters} from "react-table";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {useEffect, useRef, useState} from "react";
import Filter from "./Filter";

export default function ReactTable({
  columns,
  data,
  sortKey = "season",
  initialSorting,
  filterCol = ["fullName"],
  pageSize = 25,
  onPageRowsChange,
  modern = false,
  compact = false,
  tight = false,
  fillLastPage = false,
  isRowHighlighted,
  highlightKey,
  scrollX = false,
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
  const [narrowViewport, setNarrowViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const update = () => setNarrowViewport(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

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

  const lastPageRowsSignature = useRef("");
  const currentPageRows = table.getRowModel().rows;
  const displayRows =
    fillLastPage && currentPageRows.length > 0 && currentPageRows.length < pagination.pageSize
      ? table.getPrePaginationRowModel().rows.slice(-pagination.pageSize)
      : currentPageRows;

  useEffect(() => {
    if (!onPageRowsChange) return;

    const pageRows = displayRows.map((row) => row.original);
    const pageRowsSignature = displayRows
      .map((row) => `${row.id}:${JSON.stringify(row.original)}`)
      .join("|");

    if (pageRowsSignature === lastPageRowsSignature.current) return;

    lastPageRowsSignature.current = pageRowsSignature;
    onPageRowsChange(pageRows);
  }, [data, displayRows, onPageRowsChange, pagination, sorting, table]);

  // Jump to the page holding the highlighted row whenever the highlight target (or sort) changes.
  useEffect(() => {
    if (!isRowHighlighted || highlightKey == null) return;

    const rowIndex = table
      .getPrePaginationRowModel()
      .rows.findIndex((row) => isRowHighlighted(row.original));
    if (rowIndex < 0) return;

    const targetPageIndex = Math.floor(rowIndex / pagination.pageSize);
    setPagination((current) =>
      current.pageIndex === targetPageIndex ? current : {...current, pageIndex: targetPageIndex}
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightKey, data, sorting, pagination.pageSize]);

  const getColumnWidth = (column) => {
    const width = column.columnDef.size;

    return width ? `${width}px` : undefined;
  };

  const paginationButtonClass = modern
    ? `${compact ? "inline-flex h-7 min-w-7 px-1 text-xs" : "inline-flex h-9 min-w-9 px-2 text-sm"} items-center justify-center rounded-md border border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-blue-500 dark:hover:bg-slate-700 dark:disabled:hover:border-slate-700 dark:disabled:hover:bg-slate-800 dark:disabled:hover:text-slate-100`
    : "px-3 py-1 rounded border transition text-black bg-gray-100 border-gray-300 hover:bg-gray-200 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-slate-900 dark:disabled:text-slate-600";

  const leafColumns = table.getAllLeafColumns();
  const columnSize = (column) => {
    const size = Number(column.columnDef.size) || 0;
    if (!narrowViewport) return size;
    const mobileSize = Number(column.columnDef.meta?.mobileSize);
    return Number.isFinite(mobileSize) && mobileSize > 0 ? mobileSize : size;
  };
  const leafSizes = leafColumns.map((column) => columnSize(column));
  const lockTableWidth = modern && leafSizes.length > 0 && leafSizes.every((size) => size > 0);
  const tableWidth = leafSizes.reduce((sum, size) => sum + size, 0);
  const stickyLeft = {};
  let stickyOffset = 0;
  for (const column of leafColumns) {
    if (!column.columnDef.meta?.sticky) continue;
    stickyLeft[column.id] = stickyOffset;
    stickyOffset += columnSize(column);
  }

  const hasStickyColumns = Object.keys(stickyLeft).length > 0;
  const stickyColClass = hasStickyColumns ? "sticky-col" : "";
  const stickyRowClass = hasStickyColumns
    ? "odd:[&_.sticky-col]:bg-white even:[&_.sticky-col]:bg-slate-50 hover:[&_.sticky-col]:bg-blue-50 dark:odd:[&_.sticky-col]:bg-slate-900 dark:even:[&_.sticky-col]:bg-slate-800 dark:hover:[&_.sticky-col]:bg-slate-800"
    : "";
  const stickyHighlightClass = hasStickyColumns
    ? "[&_.sticky-col]:bg-blue-100 hover:[&_.sticky-col]:bg-blue-200 dark:[&_.sticky-col]:bg-blue-900 dark:hover:[&_.sticky-col]:bg-blue-900"
    : "";

  const getStickyStyle = (columnId, zIndex) => {
    if (stickyLeft[columnId] == null) return undefined;
    return {
      position: "sticky",
      left: stickyLeft[columnId],
      zIndex,
    };
  };

  const frameClass = modern
    ? `overflow-hidden ${compact ? "rounded-md" : "rounded-lg"} border border-slate-200 dark:border-slate-700`
    : undefined;
  const scrollerClass = `relative max-w-full overflow-x-auto ${
    scrollX
      ? "overscroll-x-contain"
      : "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
  }`;
  const mobileTightPad = scrollX ? "max-sm:px-0.5" : "";

  return (
    <div>
      <div className={frameClass}>
      <div
        className={scrollerClass}
        role={scrollX ? "region" : undefined}
        aria-label={scrollX ? "Player stats" : undefined}
        tabIndex={scrollX ? 0 : undefined}
      >
        <table
          style={
            lockTableWidth
              ? scrollX
                ? { width: tableWidth, minWidth: tableWidth }
                : { width: "100%", maxWidth: tableWidth, minWidth: 0 }
              : undefined
          }
          className={modern ? `${tight ? "text-xs 2xl:text-sm" : "text-sm"} table-fixed ${hasStickyColumns ? "border-separate border-spacing-0" : "border-collapse"} ${lockTableWidth && !scrollX ? "w-full" : lockTableWidth ? "" : "w-max"}` : "border border-black p-2 m-1"}
        >
        {modern && (
          <colgroup>
            {leafColumns.map((column) => (
              <col
                key={column.id}
                style={{
                  width: lockTableWidth
                    ? scrollX
                      ? `${columnSize(column)}px`
                      : `${(columnSize(column) / tableWidth) * 100}%`
                    : getColumnWidth(column),
                }}
              />
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
                        ? `min-w-0 border-b border-slate-200 bg-slate-50 ${tight ? "px-1 py-1 text-xs 2xl:text-sm" : compact ? "px-1 py-1 text-xs" : "px-2 py-2 text-xs"} ${mobileTightPad} text-left font-semibold uppercase text-slate-600 first:rounded-tl-lg last:rounded-tr-lg dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 whitespace-nowrap ${stickyLeft[header.column.id] != null ? stickyColClass : ""} ${headerClassName}`
                        : ""
                    }
                    style={getStickyStyle(header.column.id, 4)}
                    key={header.id}
                    colSpan={header.colSpan}
                  >
                    <div className={`flex items-center gap-1 ${scrollX ? "max-sm:gap-0" : ""} ${isRightAligned ? "justify-end" : "justify-between"}`}>
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
                          <span className={`${tight ? "ml-0.5 align-middle text-[10px] opacity-70 xl:ml-1 xl:text-xs" : "ml-1 align-middle text-xs opacity-70"} ${scrollX && !header.column.getIsSorted() ? "max-sm:hidden" : ""}`}>
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
          {displayRows?.map((row, i) => {
            const isNHL =
              row?.original["league.name"] == "National Hockey League" ||
              row?.original["league.name"] == "NHL";
            const isHighlighted = Boolean(isRowHighlighted?.(row.original));
            return (
              <tr
                key={row.id}
                aria-current={isHighlighted ? "true" : undefined}
                className={
                  modern
                    ? isHighlighted
                      ? `whitespace-nowrap font-semibold bg-blue-100 odd:bg-blue-100 even:bg-blue-100 hover:bg-blue-200 shadow-[inset_3px_0_0_0_#2563eb] dark:bg-blue-900/60 dark:odd:bg-blue-900/60 dark:even:bg-blue-900/60 dark:hover:bg-blue-900/80 ${stickyHighlightClass}`
                      : `whitespace-nowrap bg-white odd:bg-white even:bg-slate-50 hover:bg-blue-50 dark:bg-slate-900 dark:odd:bg-slate-900 dark:even:bg-slate-800/70 dark:hover:bg-slate-800 ${stickyRowClass}`
                    : isHighlighted ? "bg-blue-100 font-semibold" : isNHL ? "bg-slate-200" : ""
                }
              >
                {row.getVisibleCells().map((cell) => {
                  const cellClassName = cell.column.columnDef.meta?.cellClassName || "";

                  return (
                    <td
                      className={
                        modern
                          ? `min-w-0 overflow-hidden text-ellipsis whitespace-nowrap border-b border-slate-200 ${tight ? "px-1" : compact ? "px-1" : "px-2"} ${mobileTightPad} text-slate-800 dark:border-slate-700 dark:text-slate-100 ${stickyLeft[cell.column.id] != null ? stickyColClass : ""} ${cellClassName}`
                          : "border-black border px-1 text-sm whitespace-nowrap"
                      }
                      style={getStickyStyle(cell.column.id, 2)}
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
                  className={modern ? `${compact ? "px-1.5 py-1" : "px-2 py-2"} whitespace-nowrap` : "border-black px-1"}
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
        <div className={modern ? `flex flex-wrap items-center ${compact ? "gap-1 px-1.5 py-1" : "gap-2 px-2 py-2"} border-t border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900` : "flex items-center gap-2 mt-2"}>
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
        <span className={modern ? `ml-auto flex items-center gap-1 ${compact ? "text-xs" : "text-sm"} text-slate-600 dark:text-slate-300` : "flex items-center gap-1"}>
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
