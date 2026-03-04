import React from 'react';
import { Modal } from './Modal';

interface AlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
    isOpen,
    onClose,
    title,
    message,
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8 font-medium leading-relaxed">
                {message}
            </p>
            <div className="flex justify-end">
                <button
                    onClick={onClose}
                    className="px-8 py-3 rounded-2xl bg-indigo-500 text-white font-bold text-sm shadow-lg hover:bg-indigo-600 transition-all"
                >
                    OK
                </button>
            </div>
        </Modal>
    );
};
