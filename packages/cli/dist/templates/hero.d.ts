export interface HeroSectionProps {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    primaryCtaText?: string;
    secondaryCtaText?: string;
    onPrimaryClick?: () => void;
    onSecondaryClick?: () => void;
}
export declare function HeroSection({ eyebrow, title, subtitle, primaryCtaText, secondaryCtaText, onPrimaryClick, onSecondaryClick, }: HeroSectionProps): import("react/jsx-runtime").JSX.Element;
export default HeroSection;
