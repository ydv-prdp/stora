'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, setDoc, doc, Timestamp, where } from 'firebase/firestore';
import styles from './dashboard.module.css';
import Navbar from '@/components/Navbar';
import FilesSection from '@/components/dashboard/FilesSection';
import NotesSection from '@/components/dashboard/NotesSection';
import TeamSection from '@/components/dashboard/TeamSection';

export default function Dashboard() {
    const { user, loading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [fileCount, setFileCount] = useState(0);
    const [memberCount, setMemberCount] = useState(0);
    const [isPro, setIsPro] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancel' | 'error' | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!user) return;

        const upgradeStatus = searchParams.get('upgrade');
        if (upgradeStatus === 'success') {
            setPaymentStatus('success');
            const handleUpgradeSuccess = async () => {
                try {
                    const customerId = `cus_${Math.random().toString(36).substr(2, 9)}`;
                    const paymentId = `pay_${Math.random().toString(36).substr(2, 9)}`;
                    const subscriptionId = `sub_${Math.random().toString(36).substr(2, 9)}`;
                    const invoiceId = `in_${Math.random().toString(36).substr(2, 9)}`;

                    // 1. Update Customers
                    await setDoc(doc(db, 'users', user.uid, 'stripe_customers', customerId), {
                        user_id: user.uid,
                        email: user.email,
                        name: user.displayName || 'Customer',
                        created_at: Timestamp.now(),
                        updated_at: Timestamp.now()
                    });

                    // 2. Update Payments
                    await setDoc(doc(db, 'users', user.uid, 'payments', paymentId), {
                        customer_id: customerId,
                        amount: 1000,
                        currency: 'usd',
                        status: 'succeeded',
                        created_at: Timestamp.now(),
                        updated_at: Timestamp.now()
                    });

                    // 3. Update Subscriptions
                    await setDoc(doc(db, 'users', user.uid, 'subscriptions', subscriptionId), {
                        customer_id: customerId,
                        user_id: user.uid,
                        plan: 'pro_plan',
                        status: 'active',
                        created_at: Timestamp.now(),
                        updated_at: Timestamp.now()
                    });

                    // 4. Update Invoices
                    await setDoc(doc(db, 'users', user.uid, 'invoices', invoiceId), {
                        customer_id: customerId,
                        amount: 1000,
                        currency: 'usd',
                        status: 'paid',
                        created_at: Timestamp.now(),
                        updated_at: Timestamp.now()
                    });

                    console.log('Stripe data successfully updated in Firestore.');
                    router.replace('/dashboard');
                } catch (error) {
                    console.error('Error updating Stripe data:', error);
                    setPaymentStatus('error');
                }
            };

            handleUpgradeSuccess();
        } else if (upgradeStatus === 'cancel') {
            setPaymentStatus('cancel');
            router.replace('/dashboard');
        }
    }, [user, searchParams, router]);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/auth');
            } else if (!user.emailVerified && user.providerData[0]?.providerId === 'password') {
                logout();
                router.push(`/auth?unverified=true&email=${encodeURIComponent(user.email || '')}`);
            }
        }
    }, [user, loading, router, logout]);

    useEffect(() => {
        if (!user) return;

        // One-time initialization for Stripe collections
        const initStripeCollections = async () => {
            if (localStorage.getItem('stora_stripe_init')) return;

            try {
                const { addDoc, doc, setDoc } = await import('firebase/firestore');
                const { Timestamp } = await import('firebase/firestore');

                // Initialize Collections by adding a user-scoped doc
                // This ensures the collections exist and the user has permissions to write their own data

                await setDoc(doc(db, 'users', user.uid, 'stripe_customers', user.uid), {
                    user_id: user.uid,
                    email: user.email,
                    name: user.displayName || user.email?.split('@')[0] || 'User',
                    created_at: Timestamp.now(),
                    updated_at: Timestamp.now()
                });

                // Using specific IDs for other collections to avoid collisions but still scoped in logic
                const initId = `init_${user.uid}`;

                await setDoc(doc(db, 'users', user.uid, 'payments', initId), {
                    customer_id: user.uid,
                    user_id: user.uid,
                    amount: 0,
                    currency: 'usd',
                    status: 'initialized',
                    created_at: Timestamp.now(),
                    updated_at: Timestamp.now()
                });

                await setDoc(doc(db, 'users', user.uid, 'subscriptions', initId), {
                    customer_id: user.uid,
                    user_id: user.uid,
                    plan: 'free',
                    status: 'active',
                    created_at: Timestamp.now(),
                    updated_at: Timestamp.now()
                });

                await setDoc(doc(db, 'users', user.uid, 'invoices', initId), {
                    customer_id: user.uid,
                    user_id: user.uid,
                    amount: 0,
                    currency: 'usd',
                    status: 'paid',
                    created_at: Timestamp.now(),
                    updated_at: Timestamp.now()
                });

                localStorage.setItem('stora_stripe_init', 'true');
                console.log('Stripe collections initialized with user data.');
            } catch (error) {
                console.error('Error initializing Stripe collections:', error);
            }
        };

        initStripeCollections();

        // Check subscription status
        const subsRef = collection(db, 'users', user.uid, 'subscriptions');
        const qSubs = query(subsRef, where('status', '==', 'active'));

        const unsubscribeSubs = onSnapshot(qSubs,
            (snapshot) => {
                setIsPro(!snapshot.empty);
            },
            (error) => {
                console.error("Error in subscriptions listener:", error);
            }
        );

        const filesRef = collection(db, 'users', user.uid, 'files');
        const unsubscribeFiles = onSnapshot(filesRef,
            (snapshot) => {
                setFileCount(snapshot.size);
            },
            (error) => {
                console.error("Error in files listener:", error);
            }
        );

        const teamRef = collection(db, 'users', user.uid, 'teamMembers');
        const unsubscribeTeam = onSnapshot(teamRef,
            (snapshot) => {
                setMemberCount(snapshot.size);
            },
            (error) => {
                console.error("Error in team members listener:", error);
            }
        );

        return () => {
            unsubscribeSubs();
            unsubscribeFiles();
            unsubscribeTeam();
        };
    }, [user]);

    if (loading) return null;
    if (!user) return null;

    const userName = user.displayName || user.email?.split('@')[0] || 'User';

    return (
        <div className={styles.dashboard}>
            <Navbar variant="dashboard" />
            <div className="grid-bg"></div>
            <div className={`container ${styles.content}`}>
                {paymentStatus && (
                    <div className={`${styles.paymentStatus} ${styles[paymentStatus]}`}>
                        <div className={styles.statusContent}>
                            {paymentStatus === 'success' && (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Upgrade successful! Welcome to Stora Pro.</span>
                                </>
                            )}
                            {paymentStatus === 'cancel' && (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Payment cancelled. You can try again whenever you're ready.</span>
                                </>
                            )}
                            {paymentStatus === 'error' && (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>Something went wrong with the payment. Please contact support.</span>
                                </>
                            )}
                        </div>
                        <button className={styles.closeStatus} onClick={() => setPaymentStatus(null)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
                <div className={styles.dashboardHeaderTier}>
                    <div className={styles.titleInfo}>
                        <div className={styles.userAvatar}>
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className={styles.pageTitle}>Dashboard</h1>
                            <p className={styles.pageSubtitle}>Manage your secure assets.</p>
                        </div>
                    </div>

                    <div className={styles.tabBar}>
                        <button
                            className={`${styles.tabItem} ${activeTab === 'overview' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                            </svg>
                            Overview
                        </button>
                        <button
                            className={`${styles.tabItem} ${activeTab === 'files' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('files')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" />
                            </svg>
                            My Files
                        </button>
                        <button
                            className={`${styles.tabItem} ${activeTab === 'notes' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('notes')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Notes
                        </button>
                        <button
                            className={`${styles.tabItem} ${activeTab === 'team' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('team')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                            </svg>
                            Team
                        </button>
                    </div>
                </div>

                <div className={styles.tabContent}>
                    {activeTab === 'overview' && (
                        <>
                            <div className={styles.statsGrid}>
                                <div className={styles.statsCard}>
                                    <div className={`${styles.statsIcon} ${styles.iconGreen}`}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                    </div>
                                    <h3>Vault Status</h3>
                                    <p>Your environment is secure and encrypted.</p>
                                    <div className={styles.statusLine}>
                                        <span className={styles.statusDot}></span>
                                        Active Protection
                                    </div>
                                </div>

                                <div className={styles.statsCard}>
                                    <div className={`${styles.statsIcon} ${styles.iconPurple}`}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                                        </svg>
                                    </div>
                                    <div className={styles.cardHeaderWithBadge}>
                                        <h3>Storage</h3>
                                        {isPro && <span className={styles.proBadge}>Pro</span>}
                                    </div>
                                    <p>{fileCount} files stored in your cloud vault.</p>
                                    <div className={isPro ? styles.proPlan : styles.standardPlan}>
                                        {isPro ? 'Pro Plan Active' : 'Standard Plan'}
                                    </div>
                                </div>

                                <div className={styles.statsCard}>
                                    <div className={`${styles.statsIcon} ${styles.iconBlue}`}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                                        </svg>
                                    </div>
                                    <h3>Team Access</h3>
                                    <p>{memberCount} active members in this workspace.</p>
                                    <button className={styles.manageTeam} onClick={() => setActiveTab('team')}>Manage Team</button>
                                </div>
                            </div>

                            <div className={styles.welcomeBanner}>
                                <div className={styles.bannerInfo}>
                                    <h2 className={styles.bannerTitle}>Welcome to Stora 2.0</h2>
                                    <p className={styles.bannerText}>
                                        You now have full access to the new file management system, secure notes, and team collaboration tools.
                                    </p>
                                </div>
                                <button className={styles.startBtn} onClick={() => setActiveTab('files')}>
                                    Start Uploading
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                                    </svg>
                                </button>
                            </div>
                        </>
                    )}

                    {activeTab === 'files' && <FilesSection uid={user.uid} isPro={isPro} />}
                    {activeTab === 'notes' && <NotesSection uid={user.uid} />}
                    {activeTab === 'team' && <TeamSection uid={user.uid} />}
                </div>
            </div>
        </div>
    );
}


