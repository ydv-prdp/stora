'use client';

import { motion } from 'framer-motion';
import styles from './FinalCTA.module.css';

const FinalCTA = () => {
    return (
        <section className={styles.cta}>
            <div className={`container ${styles.container}`}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className={styles.content}
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className={styles.glow}
                    />
                    <h2 className={styles.title}>Ready to secure your <br />team's workflow?</h2>
                    <p className={styles.subtitle}>Join over 10,000+ teams who trust Stora for their sensitive assets.</p>
                    <div className={styles.actions}>
                        <button className={styles.btnPrimary}>Get Started Now</button>
                        <button className={styles.btnSecondary}>Talk to Sales</button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FinalCTA;
