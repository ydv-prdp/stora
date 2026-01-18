'use client';

import { motion } from 'framer-motion';
import styles from './Stats.module.css';

const stats = [
    { number: '99.9%', label: 'Uptime SLA' },
    { number: '10k+', label: 'Teams Trust Us' },
    { number: '256-bit', label: 'AES Encryption' },
    { number: '24/7', label: 'Expert Support' }
];

const Stats = () => {
    return (
        <section className={styles.stats}>
            <div className={`container ${styles.container}`}>
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className={styles.item}
                    >
                        <span className={styles.number}>{stat.number}</span>
                        <span className={styles.label}>{stat.label}</span>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Stats;
