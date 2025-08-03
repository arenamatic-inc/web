import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, OnChangeFn, SortingState, useReactTable } from "@tanstack/react-table";

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

    return (
        <div className="overflow-x-auto border border-white/30 bg-black/20 backdrop-blur-sm rounded p-4">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>

            <input
                type="text"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search..."
                className="mb-4 px-2 py-1 rounded border border-gray-600 bg-gray-900 text-white"
            />

            <table className="min-w-full text-sm">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="p-2 text-left font-bold cursor-pointer"
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
