'use client';

import { motion } from 'framer-motion';
import styles from './Features.module.css';

const features = [
    {
        title: 'End-to-End Encryption',
        description: 'Your data is encrypted before it leaves your device. No one else can read it.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="var(--primary)" strokeWidth="2" />
                <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="var(--primary)" strokeWidth="2" />
            </svg>
        )
    },
    {
        title: 'Identity Verification',
        description: 'Multi-factor authentication and biometric security for every login.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="7" r="4" stroke="var(--primary)" strokeWidth="2" />
            </svg>
        )
    },
    {
        title: 'Team Permissions',
        description: 'Granular access control. Manage who sees what with just a few clicks.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
                <circle cx="9" cy="7" r="4" stroke="var(--primary)" strokeWidth="2" />
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2522 22.1614 16.5523C21.6184 15.8524 20.8581 15.3516 20 15.12" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
            </svg>
        )
    }
];

const Features = () => {
    return (
        <section className={styles.features} id="product">
            <div className={`container ${styles.featuresContainer}`}>
                <div className={styles.header}>
                    <h2 className={styles.sectionTitle}>Everything you need to <span className={styles.highlight}>scale fast</span></h2>
                    <p className={styles.sectionSubtitle}>Powerful tools designed to help teams collaborate securely without compromising speed.</p>
                </div>

                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={styles.card}
                        >
                            <div className={styles.iconBox}>
                                {feature.icon}
                            </div>
                            <h3 className={styles.featureTitle}>{feature.title}</h3>
                            <p className={styles.description}>{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
