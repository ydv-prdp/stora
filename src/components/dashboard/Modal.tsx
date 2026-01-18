import React from 'react';
import styles from './Modal.module.css';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel: string;
    loading?: boolean;
    variant?: 'primary' | 'danger';
    submitBtnDisabled?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    onSubmit,
    submitLabel,
    loading,
    variant = 'primary',
    submitBtnDisabled = false
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.overlay}>
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className={styles.modal}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    >
                        <div className={styles.header}>
                            <h2 className={styles.title}>{title}</h2>
                            <button className={styles.closeBtn} onClick={onClose}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={onSubmit} className={styles.form}>
                            <div className={styles.body}>
                                {children}
                            </div>
                            <div className={styles.footer}>
                                <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`${styles.submitBtn} ${variant === 'danger' ? styles.submitBtnDanger : ''}`}
                                    disabled={loading || submitBtnDisabled}
                                >
                                    {loading ? 'Processing...' : submitLabel}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};


export default Modal;
