'use client';

import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, deleteDoc, doc, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import styles from './Sections.module.css';
import Modal from './Modal';

interface Folder {
    id: string;
    name: string;
}

interface File {
    id: string;
    name: string;
    size: string;
    type: string;
    folderId?: string;
    downloadURL: string;
    storagePath: string;
}

const FilesSection = ({ uid, isPro }: { uid: string, isPro: boolean }) => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Explorer state
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'folder' | 'file', storagePath?: string } | null>(null);

    // Form states
    const [folderName, setFolderName] = useState('');
    const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
    const [selectedFolder, setSelectedFolder] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const MAX_FILES = 5;
    const MAX_SIZE_MB = 10;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    useEffect(() => {
        if (!uid) return;

        const foldersRef = collection(db, 'users', uid, 'folders');
        const qFolders = query(foldersRef, orderBy('createdAt', 'desc'));

        const unsubscribeFolders = onSnapshot(qFolders,
            (snapshot) => {
                const folderData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Folder));
                setFolders(folderData);
            },
            (error) => {
                console.error("Error in folders listener:", error);
            }
        );

        const filesRef = collection(db, 'users', uid, 'files');
        const qFiles = query(filesRef, orderBy('createdAt', 'desc'));

        const unsubscribeFiles = onSnapshot(qFiles,
            (snapshot) => {
                const fileData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as File));
                setFiles(fileData);
                setLoading(false);
            },
            (error) => {
                console.error("Error in files listener:", error);
                setLoading(false);
            }
        );

        return () => {
            unsubscribeFolders();
            unsubscribeFiles();
        };
    }, [uid]);

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!folderName.trim()) return;
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'users', uid, 'folders'), {
                name: folderName,
                createdAt: Timestamp.now()
            });
            setFolderName('');
            setIsFolderModalOpen(false);
        } catch (error) {
            console.error('Error creating folder:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > MAX_SIZE_BYTES) {
                setUploadError(`File too large (max ${MAX_SIZE_MB}MB)`);
                setSelectedFile(null);
                return;
            }
            setSelectedFile(file);
            setUploadError('');
        }
    };

    const handleAddFile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setUploadError('Please select a file first');
            return;
        }

        if (!isPro && files.length >= MAX_FILES) {
            setUploadError(`You've reached the free plan limit of ${MAX_FILES} files. Please upgrade to Pro for unlimited uploads.`);
            return;
        }

        setIsSubmitting(true);
        setUploadProgress(0);
        setUploadError('');

        try {
            const fileId = `${Date.now()}-${selectedFile.name}`;
            const storagePath = `user_uploads/${uid}/${fileId}`;
            const storageRef = ref(storage, storagePath);
            const uploadTask = uploadBytesResumable(storageRef, selectedFile);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(Math.round(progress));
                },
                (error) => {
                    console.error('Upload failed:', error);
                    setUploadError('Upload failed. Please try again.');
                    setIsSubmitting(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    await addDoc(collection(db, 'users', uid, 'files'), {
                        name: selectedFile.name,
                        size: formatFileSize(selectedFile.size),
                        type: selectedFile.name.split('.').pop()?.toUpperCase() || 'FILE',
                        downloadURL,
                        storagePath,
                        folderId: currentFolderId || selectedFolder || null,
                        createdAt: Timestamp.now()
                    });

                    setSelectedFile(null);
                    setUploadProgress(0);
                    setSelectedFolder('');
                    setIsFileModalOpen(false);
                    setIsSubmitting(false);
                }
            );
        } catch (error) {
            console.error('Error adding file:', error);
            setUploadError('An error occurred. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handleDeleteItem = (id: string, type: 'folder' | 'file', storagePath?: string) => {
        setItemToDelete({ id, type, storagePath });
        setIsDeleteModalOpen(true);
    };

    const handleExecuteDelete = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!itemToDelete) return;

        setIsSubmitting(true);
        try {
            if (itemToDelete.type === 'file' && itemToDelete.storagePath) {
                const storageRef = ref(storage, itemToDelete.storagePath);
                await deleteObject(storageRef);
            }

            const collectionPath = itemToDelete.type === 'folder' ? 'folders' : 'files';
            await deleteDoc(doc(db, 'users', uid, collectionPath, itemToDelete.id));

            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            console.error(`Error deleting ${itemToDelete.type}:`, error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownload = (url: string) => {
        window.open(url, '_blank');
    };

    // Filtered data based on navigation
    const filteredFolders = currentFolderId ? [] : folders;
    const filteredFiles = files.filter(f => f.folderId === currentFolderId);
    const currentFolderName = folders.find(f => f.id === currentFolderId)?.name;

    const isAtLimit = !isPro && files.length >= MAX_FILES;
    const STRIPE_PRO_PLAN_LINK = 'https://buy.stripe.com/test_5kQeVc0tt95SgIz6Ip5Vu01';

    const handleUpgrade = (e: React.FormEvent) => {
        e.preventDefault();
        window.location.href = STRIPE_PRO_PLAN_LINK;
    };

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>My Files</h2>
                <div className={styles.actions}>
                    {isAtLimit && (
                        <div className={styles.limitBadge}>
                            <span>Free Plan Limit Reached</span>
                            <button className={styles.upgradeLink} onClick={() => setIsUpgradeModalOpen(true)}>Upgrade</button>
                        </div>
                    )}
                    <button className={styles.btnSecondary} onClick={() => setIsFolderModalOpen(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        New Folder
                    </button>
                    <button
                        className={styles.btnPrimary}
                        onClick={() => setIsFileModalOpen(true)}
                        disabled={isAtLimit}
                        title={isAtLimit ? `Limit reached (max ${MAX_FILES} files)` : ""}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                        </svg>
                        Add File
                    </button>
                </div>
            </div>

            {currentFolderId && (
                <div className={styles.breadcrumb}>
                    <span className={styles.crumbLink} onClick={() => setCurrentFolderId(null)}>My Files</span>
                    <span className={styles.separator}>/</span>
                    <span className={styles.activeCrumb}>{currentFolderName}</span>
                </div>
            )}

            <div className={styles.explorerContainer}>
                <table className={styles.explorerTable}>
                    <thead className={styles.tableHeader}>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Size</th>
                            <th className={styles.actionCell}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className={styles.loadingText}>Loading files...</td>
                            </tr>
                        ) : (
                            <>
                                {filteredFolders.map(folder => (
                                    <tr key={folder.id} className={styles.tableRow}>
                                        <td className={styles.tableCell}>
                                            <div className={styles.nameCell} onClick={() => setCurrentFolderId(folder.id)}>
                                                <div className={`${styles.iconWrapper} ${styles.folderIcon}`}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" />
                                                    </svg>
                                                </div>
                                                <span className={styles.clickableFolder}>{folder.name}</span>
                                            </div>
                                        </td>
                                        <td className={`${styles.tableCell} ${styles.typeCell}`}>-</td>
                                        <td className={`${styles.tableCell} ${styles.sizeCell}`}>-</td>
                                        <td className={`${styles.tableCell} ${styles.actionCell}`}>
                                            <button className={styles.deleteBtn} onClick={() => handleDeleteItem(folder.id, 'folder')}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredFiles.map(file => (
                                    <tr key={file.id} className={styles.tableRow}>
                                        <td className={styles.tableCell}>
                                            <div className={styles.nameCell}>
                                                <div className={`${styles.iconWrapper} ${styles.fileIcon}`}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                                                        <path d="M13 2v7h7" />
                                                    </svg>
                                                </div>
                                                <span>{file.name}</span>
                                            </div>
                                        </td>
                                        <td className={`${styles.tableCell} ${styles.typeCell}`}>{file.type}</td>
                                        <td className={`${styles.tableCell} ${styles.sizeCell}`}>{file.size}</td>
                                        <td className={`${styles.tableCell} ${styles.actionCell}`}>
                                            <div className={styles.tableActions}>
                                                <button className={styles.downloadBtn} onClick={() => handleDownload(file.downloadURL)} title="Download">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                                    </svg>
                                                </button>
                                                <button className={styles.deleteBtn} onClick={() => handleDeleteItem(file.id, 'file', file.storagePath)}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && filteredFolders.length === 0 && filteredFiles.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className={styles.loadingText}>
                                            {currentFolderId ? 'This folder is empty' : 'No files found'}
                                        </td>
                                    </tr>
                                )}
                            </>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <Modal
                isOpen={isFolderModalOpen}
                onClose={() => setIsFolderModalOpen(false)}
                title="Create New Folder"
                onSubmit={handleCreateFolder}
                submitLabel="Create Folder"
                loading={isSubmitting}
            >
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Folder Name</label>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Project Assets"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        required
                    />
                </div>
            </Modal>

            <Modal
                isOpen={isFileModalOpen}
                onClose={() => {
                    if (!isSubmitting) {
                        setIsFileModalOpen(false);
                        setSelectedFile(null);
                        setUploadProgress(0);
                        setUploadError('');
                    }
                }}
                title="Upload File"
                onSubmit={handleAddFile}
                submitLabel={isSubmitting ? `Uploading ${uploadProgress}%` : "Upload File"}
                loading={isSubmitting}
            >
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Choose File (Max 10MB)</label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className={styles.fileInputHidden}
                        onChange={handleFileChange}
                    />
                    <div
                        className={styles.filePickerCustom}
                        onClick={() => !isSubmitting && fileInputRef.current?.click()}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                        </svg>
                        <span>{selectedFile ? selectedFile.name : 'Click to select a file'}</span>
                        {selectedFile && <span className={styles.fileSizeBadge}>{formatFileSize(selectedFile.size)}</span>}
                    </div>
                </div>

                {isSubmitting && (
                    <div className={styles.progressContainer}>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                        <span className={styles.progressText}>{uploadProgress}% Complete</span>
                    </div>
                )}

                {uploadError && <div className={styles.errorText}>{uploadError}</div>}

                {!currentFolderId && (
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Folder (Optional)</label>
                        <select
                            className={styles.input}
                            value={selectedFolder}
                            onChange={(e) => setSelectedFolder(e.target.value)}
                            disabled={isSubmitting}
                        >
                            <option value="">None</option>
                            {folders.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </Modal>

            {/* Upgrade Modal */}
            <Modal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                title="Upgrade your plan"
                onSubmit={handleUpgrade}
                submitLabel="Upgrade Plan"
                submitBtnDisabled={false}
            >
                <div className={styles.upgradeContent}>
                    <div className={styles.upgradeIcon}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#008a5c" strokeWidth="1.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <p>You've reached the free plan limit of 5 files. Upgrade to Pro to enjoy unlimited storage, advanced security features, and priority support.</p>
                    <ul className={styles.benefitList}>
                        <li>Unlimited File Uploads</li>
                        <li>Up to 100GB Storage</li>
                        <li>Advanced Team Permissions</li>
                        <li>24/7 Priority Support</li>
                    </ul>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    if (!isSubmitting) {
                        setIsDeleteModalOpen(false);
                        setItemToDelete(null);
                    }
                }}
                title="Confirm Deletion"
                onSubmit={handleExecuteDelete}
                submitLabel="Delete"
                loading={isSubmitting}
                variant="danger"
            >
                <div className={styles.deleteConfirmMessage}>
                    <p>Are you sure you want to delete this {itemToDelete?.type}?</p>
                    <p className={styles.deleteWarning}>This action cannot be undone.</p>
                </div>
            </Modal>
        </section>
    );
};

export default FilesSection;
