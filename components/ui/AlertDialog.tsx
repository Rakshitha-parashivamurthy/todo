import React from 'react';
import { Modal } from './Modal';

interface AlertDialogProps {
    isOpen: boolean;
    onClose?: () => void;
    onConfirm?: () => void;
    onCancel?: () => void;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    confirmIcon?: React.ReactNode;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    onCancel,
    title,
    message,
    confirmText = 'OK',
    cancelText = 'Cancel',
    confirmIcon,
}) => {
    const handleClose = () => {
        if (onClose) onClose();
        else if (onCancel) onCancel();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={title}>
            <div className="text-neutral-500 dark:text-neutral-400 mb-8 font-medium leading-relaxed">
                {message}
            </div>
            <div className="flex justify-end gap-3">
                {onCancel && (
                    <button
                        onClick={handleClose}
                        className="px-6 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-semibold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                    >
                        {cancelText}
                    </button>
                )}
                <button
                    onClick={onConfirm || handleClose}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-semibold text-sm shadow-md hover:bg-indigo-600 transition-all"
                >
                    {confirmIcon}
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
};
