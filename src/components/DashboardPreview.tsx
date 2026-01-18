'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from './DashboardPreview.module.css';

const DashboardPreview = () => {
    return (
        <section className={styles.preview}>
            <div className={`container ${styles.previewContainer}`}>
                <motion.div
                    initial={{ opacity: 0, y: 40, rotateX: 10 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className={styles.card}
                >
                    <div className={styles.gridOverlay}></div>
                    <div className={styles.glow}></div>

                    <div className={styles.content}>
                        <div className={styles.topBar}>
                            <div className={styles.circles}>
                                <span className={styles.dot}></span>
                                <span className={styles.dot}></span>
                                <span className={styles.dot}></span>
                            </div>
                        </div>

                        <div className={styles.imageWrapper}>
                            <Image
                                src="/dashboard-preview.png"
                                alt="Stora Dashboard Preview"
                                fill
                                className={styles.dashboardImage}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default DashboardPreview;
