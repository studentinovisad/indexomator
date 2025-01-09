import '@tanstack/table-core';

declare module '@tanstack/table-core' {
    interface TableState {
        editables?: SvelteMap;
    }
    interface ColumnMeta<TData extends RowData, TValue> {
        editable?: boolean,
        editableChoices?: (data: any) => string[]
    }
    interface TableMeta<TData extends RowData> {
        setEditChanges: (id: number, changes?: PersonEditable) => void,
        getEditChanges: (id: number) => PersonEditable | null,
        hasEditChanges: (id: number) => boolean,
    }
}