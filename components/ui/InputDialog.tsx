import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';

interface InputDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (value: string) => void;
    title: string;
    placeholder?: string;
    submitLabel?: string;
}

export const InputDialog: React.FC<InputDialogProps> = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    placeholder = '',
    submitLabel = 'Save',
}) => {
    const [value, setValue] = useState('');

    useEffect(() => {
        if (isOpen) setValue('');
    }, [isOpen]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (value.trim()) {
            onSubmit(value);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit}>
                <input
                    autoFocus
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold mb-8 dark:text-white"
                />
                <div className="flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-700 font-bold text-sm hover:opacity-80 transition-opacity text-neutral-700 dark:text-neutral-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!value.trim()}
                        className="px-6 py-3 rounded-2xl bg-indigo-500 text-white font-bold text-sm shadow-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {submitLabel}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
