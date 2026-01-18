import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.container}`}>
                <div className={styles.top}>
                    <div className={styles.brand}>
                        <div className={styles.logo}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L3 7V12C3 17.41 6.84 22.38 12 24C17.16 22.38 21 17.41 21 12V7L12 2Z" fill="var(--primary)" />
                            </svg>
                            <span className={styles.logoText}>Stora</span>
                        </div>
                        <p className={styles.tagline}>The secure workspace for modern teams. Built for privacy, scaled for performance.</p>
                    </div>

                    <div className={styles.linksGrid}>
                        <div className={styles.linkColumn}>
                            <h4 className={styles.columnTitle}>Product</h4>
                            <Link href="#product" className={styles.link}>Features</Link>
                            <Link href="#pricing" className={styles.link}>Pricing</Link>
                            <Link href="#" className={styles.link}>Security</Link>
                            <Link href="#" className={styles.link}>Changelog</Link>
                        </div>
                        <div className={styles.linkColumn}>
                            <h4 className={styles.columnTitle}>Resources</h4>
                            <Link href="#" className={styles.link}>Documentation</Link>
                            <Link href="#" className={styles.link}>Guides</Link>
                            <Link href="#" className={styles.link}>API Reference</Link>
                            <Link href="#" className={styles.link}>Status</Link>
                        </div>
                        <div className={styles.linkColumn}>
                            <h4 className={styles.columnTitle}>Company</h4>
                            <Link href="#" className={styles.link}>About</Link>
                            <Link href="#" className={styles.link}>Blog</Link>
                            <Link href="#" className={styles.link}>Careers</Link>
                            <Link href="#" className={styles.link}>Legal</Link>
                        </div>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>© 2026 Stora Inc. All rights reserved.</p>
                    <div className={styles.socials}>
                        <Link href="#" className={styles.socialLink}>Twitter</Link>
                        <Link href="#" className={styles.socialLink}>LinkedIn</Link>
                        <Link href="#" className={styles.socialLink}>GitHub</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
