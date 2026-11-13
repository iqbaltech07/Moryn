import React from "react";
export interface ConfigFormProps {
    title?: string;
    onSubmit?: (data: Record<string, string>) => void;
}
/**
 * ConfigForm - Accessible Input Form (Anti-Slop Compliant)
 */
export declare function ConfigForm({ title, onSubmit, }: ConfigFormProps): React.JSX.Element;
export default ConfigForm;
