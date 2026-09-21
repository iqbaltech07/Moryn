export interface ConfigFormProps {
    title?: string;
    onSubmit?: (data: Record<string, string>) => void;
}
/**
 * ConfigForm - Accessible Input Form (Anti-Slop Compliant)
 */
export declare function ConfigForm({ title, onSubmit, }: ConfigFormProps): import("react/jsx-runtime").JSX.Element;
export default ConfigForm;
