// import {useTable, useSortBy, useFilters} from "react-table";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useState } from "react";

export default function ReactTable({columns, data, sortKey = "season", sortDesc = true, rowClassName, mobileFit = false, modern = false, compact = false}) {

  const [sorting, setSorting] = useState([{
            id: sortKey,
            desc: sortDesc,
          },]);
  const [expandedColumns, setExpandedColumns] = useState({})

  const toggleExpandedColumn = (column) => {
    if (!column.columnDef.meta?.expandOnDoubleClick) return

    setExpandedColumns((current) => ({
      ...current,
      [column.id]: !current[column.id],
    }))
  }

  const getColumnWidth = (column) => {
    const meta = column.columnDef.meta || {}
    const width = expandedColumns[column.id] ? meta.expandedSize : column.columnDef.size

    return width ? `${width}px` : undefined
  }

  const getTruncationClass = (column) => {
    if (!modern || !column.columnDef.meta?.truncate || expandedColumns[column.id]) return ""

    return "max-w-0 overflow-hidden text-ellipsis"
  }

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
    <div>
    <div
      className={`relative overflow-x-auto max-w-full ${
        mobileFit || compact
          ? "pb-1"
          : "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      } ${modern ? `${compact ? "rounded-md" : "rounded-lg"} border border-slate-200 dark:border-slate-700` : ""}`}
    >
      <table
        className={modern ? `${compact ? "w-max text-sm" : "min-w-[58rem] w-full text-sm"} table-fixed border-collapse` : `${mobileFit ? "w-max m-0" : "m-1"} border border-black dark:border-gray-600 px-1`}
      >
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
                const headerClassName = header.column.columnDef.meta?.headerClassName || ""
                const canExpand = header.column.columnDef.meta?.expandOnDoubleClick
                const isRightAligned = headerClassName.includes("text-right")
                const isGroupedHeader = modern && header.colSpan > 1

                return (
                  <th
                    className={
                      modern
                        ? `border-b border-r border-slate-200 bg-slate-50 ${compact ? "px-1.5 py-1" : "px-2 py-2"} text-left text-xs font-semibold uppercase text-slate-600 first:rounded-tl-lg last:rounded-tr-lg last:border-r-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 whitespace-nowrap ${isGroupedHeader ? "border-t bg-slate-100 text-center tracking-wide dark:bg-slate-700/70" : ""} ${headerClassName}`
                        : `${mobileFit ? "px-1 text-xs sm:text-sm whitespace-nowrap" : "px-1 whitespace-nowrap"} bg-white dark:bg-gray-800 dark:text-white border border-blue-600 dark:border-blue-500`
                    }
                    key={header.id}
                    colSpan={header.colSpan}
                    onDoubleClick={() => toggleExpandedColumn(header.column)}
                    title={canExpand ? "Double-click to toggle column width" : undefined}
                  >
                    <div className={`flex items-center gap-1 ${isGroupedHeader ? "justify-center" : isRightAligned ? "justify-end" : "justify-between"}`}>
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
                    </div>
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
          const defaultRowClass = modern
            ? "bg-white odd:bg-white even:bg-slate-50 hover:bg-blue-50 dark:bg-slate-900 dark:odd:bg-slate-900 dark:even:bg-slate-800/70 dark:hover:bg-slate-800"
            : isNHL ? "bg-slate-200 dark:bg-gray-700" : "dark:bg-gray-800";

          return (
            <tr key={row.id} className={`whitespace-nowrap ` + (customRowClass ?? defaultRowClass)}>
              {row.getVisibleCells().map((cell) => {
                const cellClassName = cell.column.columnDef.meta?.cellClassName || ""

                return (
                  <td
                    className={
                      modern
                        ? `border-b border-r border-slate-200 ${compact ? "px-1.5" : "px-2"} text-slate-800 last:border-r-0 dark:border-slate-700 dark:text-slate-100 whitespace-nowrap ${getTruncationClass(cell.column)} ${cellClassName}`
                        : `${mobileFit ? "px-1 text-xs sm:text-sm" : "px-1 text-sm"} border-black dark:border-gray-600 border dark:text-gray-200 whitespace-nowrap`
                    }
                    key={cell.id}
                    onDoubleClick={() => toggleExpandedColumn(cell.column)}
                    title={cell.column.columnDef.meta?.truncate ? String(cell.getValue() ?? "") : undefined}
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
            className={
              modern
                ? "bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                : `${mobileFit ? "text-[10px] sm:text-xs font-semibold" : "text-xs font-semibold"} bg-slate-300 dark:bg-gray-700 py-px dark:text-white`
            }
          >
            {footerGroup.headers.map((header) => (
              <td
                key={header.id}
                colSpan={header.colSpan}
                className={modern ? `border-r border-t border-slate-200 last:border-r-0 dark:border-slate-700 ${compact ? "px-1.5 py-1" : "px-2 py-2"} whitespace-nowrap` : `px-1 border-black whitespace-nowrap`}
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
    </div>
  );
}
