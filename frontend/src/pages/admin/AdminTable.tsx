import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    OnChangeFn,
    SortingState,
    useReactTable,
    Row,
} from "@tanstack/react-table";
import { isValidElement } from "react";

export function AdminTable<T extends Record<string, any>>({
    data,
    columns,
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
    title,
    onLoadMore,
}: {
    data: T[];
    columns: ColumnDef<T>[];
    sorting: SortingState;
    setSorting: OnChangeFn<SortingState>;
    globalFilter: string;
    setGlobalFilter: (v: string) => void;
    title: string;
    onLoadMore?: () => void;
}) {
    const table = useReactTable({
        data,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: (row, _, filterValue) =>
            Object.values(row.original).some((value) => {
                if (typeof value === "string") return value.toLowerCase().includes(filterValue.toLowerCase());
                if (Array.isArray(value)) return value.some((v) => v.toLowerCase().includes(filterValue.toLowerCase()));
                if (typeof value === "number") return value.toString().includes(filterValue);
                return false;
            }),
    });

    function exportTableToCsv(filename: string = "export.csv") {
        const leafColumns = table.getVisibleLeafColumns();
        const headerGroups = table.getHeaderGroups();

        const getRenderableText = (value: unknown): string => {
            if (value === null || value === undefined) return "";
            if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                return String(value);
            }
            if (Array.isArray(value)) {
                return value.map(getRenderableText).join("");
            }
            if (isValidElement(value)) {
                return getRenderableText((value.props as { children?: unknown })?.children);
            }
            return "";
        };

        const escapeCsv = (value: unknown): string => {
            if (value === null || value === undefined) return '""';
            let text: string;
            if (typeof value === "string") {
                text = value;
            } else if (typeof value === "number" || typeof value === "boolean") {
                text = typeof value === "number"
                    ? (value / 100).toFixed(2)
                    : String(value);
            } else {
                text = JSON.stringify(value);
            }
            text = text.replace(/<[^>]+>/g, "");
            return `"${text.replace(/"/g, '""')}"`;
        };

        const getHeaderLabel = (header: unknown, fallbackId: string): string => {
            if (typeof header === "string") return header;
            if (typeof header === "number" || typeof header === "boolean") return String(header);
            return fallbackId;
        };

        const headerRows: string[][] = Array.from(
            { length: headerGroups.length },
            () => Array(leafColumns.length).fill("")
        );

        headerGroups.forEach((headerGroup, rowIndex) => {
            let columnOffset = 0;
            headerGroup.headers.forEach((header) => {
                const startIndex = columnOffset;
                columnOffset += header.colSpan;
                if (header.isPlaceholder) return;

                headerRows[rowIndex][startIndex] = getHeaderLabel(
                    header.column.columnDef.header,
                    String(header.column.id)
                );
            });
        });

        const rows: string[] = headerRows.map((headerRow) =>
            headerRow.map(cell => escapeCsv(cell)).join(",")
        );

        table.getRowModel().rows.forEach((row: Row<T>) => {
            const visibleCellsByColumnId = new Map(
                row.getVisibleCells().map((cell) => [String(cell.column.id), cell])
            );

            const rowVals: string[] = leafColumns.map(col => {
                let value = row.getValue(col.id);
                if (value === undefined) {
                    const accessorFn = (col as any).accessorFn as ((originalRow: T, index: number) => unknown) | undefined;
                    if (typeof accessorFn === "function") {
                        value = accessorFn(row.original, row.index);
                    }
                }

                if (value === undefined) {
                    const accessorKey = (col.columnDef as any).accessorKey;
                    if (accessorKey !== undefined && accessorKey !== null) {
                        value = row.original[accessorKey as keyof T];
                    }
                }

                if (value === undefined) {
                    const cell = visibleCellsByColumnId.get(String(col.id));
                    if (cell) {
                        const rendered = flexRender(cell.column.columnDef.cell, cell.getContext());
                        const renderedText = getRenderableText(rendered);
                        if (renderedText !== "") {
                            value = renderedText;
                        }
                    }
                }

                return escapeCsv(value);
            });
            rows.push(rowVals.join(","));
        });

        const csvContent = rows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    const leafColumns = table.getAllLeafColumns();
    const groupBoundaryLeafIds = new Set<string>();
    const hasMultipleHeaderRows = table.getHeaderGroups().length > 1;

    for (let i = 0; i < leafColumns.length - 1; i += 1) {
        const current = leafColumns[i] as any;
        const next = leafColumns[i + 1] as any;

        const getTopLevelId = (column: any): string => {
            let node = column;
            while (node?.parent) node = node.parent;
            return String(node?.id ?? "");
        };

        if (getTopLevelId(current) !== getTopLevelId(next)) {
            groupBoundaryLeafIds.add(String(current.id));
        }
    }

    return (
        <div className="border border-white/30 bg-black/20 backdrop-blur-sm rounded p-4">
            <div className="flex flex-wrap items-center gap-4 mb-4">
                <h2 className="text-xl font-semibold">{title}</h2>
                <button
                    className="px-3 py-1 rounded border border-gray-600 bg-gray-900 text-white"
                    onClick={() => exportTableToCsv(`${title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`)}
                >
                    Export to CSV
                </button>
                <input
                    type="text"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Search..."
                    className="px-2 py-1 rounded border border-gray-600 bg-gray-900 text-white"
                />
            </div>

            <div className="max-h-[70vh] overflow-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header, headerIndex) => {
                                    const isLeafHeader = header.colSpan === 1;
                                    const hasLeafDivider = isLeafHeader && groupBoundaryLeafIds.has(String(header.column.id));
                                    const hasTopGroupDivider =
                                        hasMultipleHeaderRows
                                        && header.depth === 0
                                        && !header.isPlaceholder
                                        && headerIndex < headerGroup.headers.length - 1;
                                    const hasGroupDivider = hasLeafDivider || hasTopGroupDivider;
                                    return (
                                        <th
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className={`sticky top-0 z-10 bg-gray-900/90 backdrop-blur-sm p-2 text-left font-bold ${header.isPlaceholder ? "cursor-default" : "cursor-pointer"} ${hasGroupDivider ? "border-r border-white/40" : ""}`}
                                            onClick={header.isPlaceholder ? undefined : header.column.getToggleSortingHandler()}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : (
                                                    <>
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                        {{ asc: " ▲", desc: " ▼" }[header.column.getIsSorted() as string] ?? null}
                                                    </>
                                                )}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="border-t border-white/10">
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className={`p-2 ${groupBoundaryLeafIds.has(String(cell.column.id)) ? "border-r border-white/40" : ""}`}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {onLoadMore && (
                <div className="mt-4 text-center">
                    <button
                        className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded"
                        onClick={onLoadMore}
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
}
