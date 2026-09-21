export interface ConfirmModalProps {
    isOpen?: boolean;
    title?: string;
    onClose?: () => void;
    onConfirm?: () => void;
}
/**
 * ConfirmModal - Elevated Dialog Modal (Anti-Slop Compliant)
 */
export declare function ConfirmModal({ isOpen: defaultOpen, title, onClose, onConfirm, }: ConfirmModalProps): import("react/jsx-runtime").JSX.Element;
export default ConfirmModal;
