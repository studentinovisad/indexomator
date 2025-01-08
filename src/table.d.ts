import '@tanstack/table-core';

declare module '@tanstack/table-core' {
    interface TableState {
        editables?: SvelteSet;
    }
    interface ColumnMeta<TData extends RowData, TValue> {
        editable?: boolean
    }
    interface TableMeta<TData extends RowData> {
        setEditStatus: (id: number, status: boolean) => void,
        getEditStatus: (id: number) => boolean,
    }
}