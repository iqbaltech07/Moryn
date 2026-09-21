export interface MetricCardsProps {
    title?: string;
    subtitle?: string;
    metrics?: Array<{
        label: string;
        amount: number;
        change: string;
    }>;
}
export declare function formatCompactCurrency(amount: number): string;
/**
 * MetricCards - Streamlined Metric KPI Cards (Anti-Slop Compliant)
 */
export declare function MetricCards({ title, subtitle, metrics, }: MetricCardsProps): import("react/jsx-runtime").JSX.Element;
export default MetricCards;
