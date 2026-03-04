import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    width?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, width = 'max-w-md' }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={`relative w-full ${width} bg-white dark:bg-neutral-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-neutral-200 dark:border-neutral-700 pointer-events-auto`}
                    >
                        <div className="p-8">
                            {(title || onClose) && (
                                <div className="flex items-center justify-between mb-6">
                                    {title && <h3 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">{title}</h3>}
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-colors text-neutral-400"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            )}
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
