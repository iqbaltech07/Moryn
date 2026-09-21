export interface DataRow {
    id: string;
    name: string;
    category: string;
    amount: number;
    status: "active" | "pending" | "failed";
    updatedAt: string;
}
export interface DataTableProps {
    title?: string;
    data?: DataRow[];
}
/**
 * DataTable - Utilitarian Data Table (Anti-Slop Compliant)
 */
export declare function DataTable({ title, data, }: DataTableProps): import("react/jsx-runtime").JSX.Element;
export default DataTable;
