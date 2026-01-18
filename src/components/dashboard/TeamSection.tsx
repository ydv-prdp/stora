'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import styles from './Sections.module.css';
import Modal from './Modal';

interface TeamMember {
    id: string;
    name: string;
    role: string;
}

const TeamSection = ({ uid }: { uid: string }) => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // CRUD state
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
    const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [role, setRole] = useState('Member');

    useEffect(() => {
        if (!uid) return;

        const membersRef = collection(db, 'users', uid, 'teamMembers');
        const q = query(membersRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
                setMembers(data);
                setLoading(false);
            },
            (error) => {
                console.error("Error in team members listener:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [uid]);

    const handleOpenCreateModal = () => {
        setIsEditMode(false);
        setEditingMemberId(null);
        setName('');
        setRole('Member');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (member: TeamMember) => {
        setIsEditMode(true);
        setEditingMemberId(member.id);
        setName(member.name);
        setRole(member.role);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (member: TeamMember) => {
        setMemberToDelete(member);
        setIsDeleteModalOpen(true);
    };

    const handleSaveMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setIsSubmitting(true);
        try {
            if (isEditMode && editingMemberId) {
                const memberRef = doc(db, 'users', uid, 'teamMembers', editingMemberId);
                await updateDoc(memberRef, {
                    name,
                    role,
                    updatedAt: Timestamp.now()
                });
            } else {
                await addDoc(collection(db, 'users', uid, 'teamMembers'), {
                    name,
                    role: role || 'Member',
                    createdAt: Timestamp.now()
                });
            }
            setIsModalOpen(false);
            setName('');
            setRole('Member');
        } catch (error) {
            console.error('Error saving member:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExecuteDelete = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!memberToDelete) return;
        setIsSubmitting(true);
        try {
            await deleteDoc(doc(db, 'users', uid, 'teamMembers', memberToDelete.id));
            setIsDeleteModalOpen(false);
            setMemberToDelete(null);
        } catch (error) {
            console.error('Error deleting member:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Team Members</h2>
                <button className={styles.btnPrimary} onClick={handleOpenCreateModal}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <path d="M20 8v6M23 11h-6" />
                    </svg>
                    Add Member
                </button>
            </div>

            {loading ? (
                <div className={styles.loadingText}>Loading team...</div>
            ) : members.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                        </svg>
                    </div>
                    <h3>No team members</h3>
                    <p>Invite your colleagues to collaborate on Stora.</p>
                </div>
            ) : (
                <div className={styles.memberList}>
                    {members.map(member => (
                        <div key={member.id} className={styles.memberCard}>
                            <div className={styles.memberInfo}>
                                <div className={styles.avatar}>
                                    {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className={styles.memberName}>{member.name}</h4>
                                    <span className={styles.memberRole}>{member.role}</span>
                                </div>
                            </div>
                            <div className={styles.memberActions}>
                                <button className={styles.cardActionBtn} onClick={() => handleOpenEditModal(member)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                                <button className={styles.cardActionBtn} onClick={() => handleOpenDeleteModal(member)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                    </svg>
                                </button>
                                <span className={styles.statusBadge}>Active</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditMode ? "Edit Team Member" : "Add Team Member"}
                onSubmit={handleSaveMember}
                submitLabel={isEditMode ? "Update Member" : "Add Member"}
                loading={isSubmitting}
            >
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Name</label>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Jane Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Role</label>
                    <select
                        className={styles.input}
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="Member">Member</option>
                        <option value="Admin">Admin</option>
                        <option value="Editor">Editor</option>
                        <option value="Viewer">Viewer</option>
                    </select>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setMemberToDelete(null);
                }}
                title="Confirm Deletion"
                onSubmit={handleExecuteDelete}
                submitLabel="Delete"
                loading={isSubmitting}
                variant="danger"
            >
                <div className={styles.deleteConfirmMessage}>
                    <p>Are you sure you want to delete {memberToDelete?.name}?</p>
                </div>
            </Modal>
        </section>
    );
};

export default TeamSection;
