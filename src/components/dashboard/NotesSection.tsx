'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import styles from './Sections.module.css';
import Modal from './Modal';

interface Note {
    id: string;
    title: string;
    content: string;
}

const NotesSection = ({ uid, isPro }: { uid: string, isPro: boolean }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const MAX_NOTES = 5;
    const isAtLimit = !isPro && notes.length >= MAX_NOTES;
    const STRIPE_PRO_PLAN_LINK = 'https://buy.stripe.com/test_5kQeVc0tt95SgIz6Ip5Vu01';

    // CRUD state
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

    // Form states
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        if (!uid) return;

        const notesRef = collection(db, 'users', uid, 'notes');
        const q = query(notesRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
                setNotes(data);
                setLoading(false);
            },
            (error) => {
                console.error("Error in notes listener:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [uid]);

    const handleOpenCreateModal = () => {
        setIsEditMode(false);
        setEditingNoteId(null);
        setTitle('');
        setContent('');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (note: Note) => {
        setIsEditMode(true);
        setEditingNoteId(note.id);
        setTitle(note.title);
        setContent(note.content);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (note: Note) => {
        setNoteToDelete(note);
        setIsDeleteModalOpen(true);
    };

    const handleSaveNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        if (!isPro && !isEditMode && notes.length >= MAX_NOTES) {
            alert(`You've reached the free plan limit of ${MAX_NOTES} notes. Please upgrade to Pro to create more.`);
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditMode && editingNoteId) {
                const noteRef = doc(db, 'users', uid, 'notes', editingNoteId);
                await updateDoc(noteRef, {
                    title,
                    content,
                    updatedAt: Timestamp.now()
                });
            } else {
                await addDoc(collection(db, 'users', uid, 'notes'), {
                    title,
                    content: content || '',
                    createdAt: Timestamp.now()
                });
            }
            setIsModalOpen(false);
            setTitle('');
            setContent('');
        } catch (error) {
            console.error('Error saving note:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExecuteDelete = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!noteToDelete) return;
        setIsSubmitting(true);
        try {
            await deleteDoc(doc(db, 'users', uid, 'notes', noteToDelete.id));
            setIsDeleteModalOpen(false);
            setNoteToDelete(null);
        } catch (error) {
            console.error('Error deleting note:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>My Notes</h2>
                <div className={styles.actions}>
                    {isAtLimit && (
                        <div className={styles.limitBadge}>
                            <span>Free Plan Limit Reached</span>
                            <button className={styles.upgradeLink} onClick={() => setIsUpgradeModalOpen(true)}>Upgrade</button>
                        </div>
                    )}
                    <button
                        className={styles.btnPrimary}
                        onClick={handleOpenCreateModal}
                        disabled={isAtLimit}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        New Note
                    </button>
                </div>
            </div>

            {loading ? (
                <div className={styles.loadingText}>Loading notes...</div>
            ) : notes.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </div>
                    <h3>No notes yet</h3>
                    <p>Jot down your thoughts and protect them with Stora.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {notes.map(note => (
                        <div key={note.id} className={styles.noteCard}>
                            <div className={styles.noteHeader}>
                                <h4 className={styles.cardName}>{note.title}</h4>
                                <div className={styles.noteActions}>
                                    <button className={styles.cardActionBtn} onClick={() => handleOpenEditModal(note)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    <button className={styles.cardActionBtn} onClick={() => handleOpenDeleteModal(note)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <p className={styles.noteSnippet}>{note.content || 'No content'}</p>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditMode ? "Edit Note" : "Create New Note"}
                onSubmit={handleSaveNote}
                submitLabel={isEditMode ? "Update Note" : "Save Note"}
                loading={isSubmitting}
            >
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Title</label>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Meeting Notes"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Content</label>
                    <textarea
                        className={styles.textarea}
                        placeholder="Start typing..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
            </Modal>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setNoteToDelete(null);
                }}
                title="Confirm Deletion"
                onSubmit={handleExecuteDelete}
                submitLabel="Delete"
                loading={isSubmitting}
                variant="danger"
            >
                <div className={styles.deleteConfirmMessage}>
                    <p>Are you sure you want to delete this note?</p>
                </div>
            </Modal>
            {/* Upgrade Modal */}
            <Modal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                title="Upgrade to Pro"
                onSubmit={(e) => { e.preventDefault(); window.location.href = STRIPE_PRO_PLAN_LINK; }}
                submitLabel="Upgrade Now"
            >
                <div className={styles.upgradeContent}>
                    <p>Upgrade to Pro to create unlimited secure notes and keep all your sensitive information in one place.</p>
                </div>
            </Modal>
        </section>
    );
};

export default NotesSection;
