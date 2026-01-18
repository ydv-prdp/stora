import styles from './LogoCloud.module.css';

const logos = [
    'LINEAR', 'FLOWSTATE', 'VERCEL', 'PRISMA', 'RAILWAY', 'SUPABASE'
];

const LogoCloud = () => {
    return (
        <section className={styles.logos}>
            <div className={`container ${styles.container}`}>
                <p className={styles.intro}>Trusted by innovative teams around the world</p>
                <div className={styles.grid}>
                    {logos.map((logo) => (
                        <div key={logo} className={styles.logoItem}>
                            {logo}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LogoCloud;
