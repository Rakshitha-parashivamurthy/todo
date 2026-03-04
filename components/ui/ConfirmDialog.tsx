import React from 'react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDanger?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isDanger = false,
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8 font-medium">
                {message}
            </p>
            <div className="flex gap-3 justify-end">
                <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-700 font-bold text-sm hover:opacity-80 transition-opacity text-neutral-700 dark:text-neutral-200"
                >
                    {cancelLabel}
                </button>
                <button
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    className={`px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-lg transition-transform active:scale-95 ${isDanger ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-500 hover:bg-indigo-600'
                        }`}
                >
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
};
