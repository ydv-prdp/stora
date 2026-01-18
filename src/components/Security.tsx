'use client';

import { motion } from 'framer-motion';
import styles from './Security.module.css';

const Security = () => {
    return (
        <section className={styles.security} id="solutions">
            <div className={`container ${styles.container}`}>
                <div className={styles.grid}>
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <span className={styles.badge}>Hardened Security</span>
                        <h2 className={styles.title}>Enterprise-grade <br /><span className={styles.highlight}>data protection</span></h2>
                        <p className={styles.description}>
                            Stora is built with a security-first architecture. We employ multiple layers of
                            defense to ensure your sensitive assets remain truly private.
                        </p>

                        <div className={styles.featureList}>
                            <div className={styles.feature}>
                                <div className={styles.iconWrapper}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className={styles.featureContent}>
                                    <h3>Zero Trust Architecture</h3>
                                    <p>Never trust, always verify. Every request is authenticated and authorized.</p>
                                </div>
                            </div>
                            <div className={styles.feature}>
                                <div className={styles.iconWrapper}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className={styles.featureContent}>
                                    <h3>Advanced Audit Logs</h3>
                                    <p>Track every action across your organization with detailed, immutable logs.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className={styles.visualSide}
                    >
                        <div className={styles.vaultVisual}>
                            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="var(--secondary)" strokeWidth="2" />
                                <path d="M12 2V4M12 20V22M4 12H2M22 12H20M5.64 5.64L7.05 7.05M16.95 16.95L18.36 18.36M5.64 18.36L7.05 16.95M16.95 7.05L18.36 5.64" stroke="var(--secondary)" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Security;
