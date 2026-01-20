'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './Hero.module.css';

const Hero = () => {
    const { user } = useAuth();
    return (
        <section className={styles.hero}>
            <div className="grid-bg"></div>
            <div className={`container ${styles.heroContainer}`}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className={styles.badge}
                >
                    <span className={styles.dot}></span>
                    SECURE STORAGE · BUILT FOR TEAMS
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className={styles.title}
                >
                    The secure workspace for <br />
                    <span className={styles.gradientText}>modern teams</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className={styles.subtitle}
                >
                    Securely manage assets, control permissions, and scale your <br />
                    organization with enterprise-grade protection.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className={styles.actions}
                >
                    <Link
                        href={user ? "/dashboard" : "/auth"}
                        className={`${styles.btnPrimary} ${user ? 'btnDisabled' : ''}`}
                    >
                        Get Started Free <span>→</span>
                    </Link>
                    <button className={styles.btnSecondary}>
                        <div className={styles.playIcon}>
                            <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L9 6L1 11V1Z" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        View Demo
                    </button>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
