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
        const leafColumns = table.getAllLeafColumns();

        const headerRow = leafColumns.map(col =>
            typeof col.columnDef.header === "string"
                ? col.columnDef.header
                : typeof col.columnDef.header === "function"
                    ? ""
                    : String(col.id)
        );

        const rows: string[] = [headerRow.join(",")];

        table.getRowModel().rows.forEach((row: Row<T>) => {
            const rowVals: string[] = leafColumns.map(col => {
                let val = String(row.getValue(col.id));
                val = '"' + val.replace(/"/g, '""') + '"';
                val = val.replace(/<[^>]+>/g, "");
                return val;
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
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="sticky top-0 z-10 bg-gray-900/90 backdrop-blur-sm p-2 text-left font-bold cursor-pointer"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {{ asc: " ▲", desc: " ▼" }[header.column.getIsSorted() as string] ?? null}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="border-t border-white/10">
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="p-2">
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
