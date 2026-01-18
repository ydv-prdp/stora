import styles from './Testimonials.module.css';

const testimonials = [
    {
        quote: "Stora has completely transformed how our design team manages sensitive assets. The speed and security are unmatched.",
        author: "Sarah Chen",
        role: "Design Lead at Linear",
        avatar: "SC"
    },
    {
        quote: "Finally, a security-first workspace that doesn't get in the way of productivity. The permission controls are exactly what we needed.",
        author: "Alex Rivers",
        role: "CTO at FlowState",
        avatar: "AR"
    },
    {
        quote: "The interface is beautiful and the security is enterprise-grade. It's rare to find a tool that excels at both.",
        author: "James Wilson",
        role: "Product Manager at Vercel",
        avatar: "JW"
    }
];

const Testimonials = () => {
    return (
        <section className={styles.testimonials}>
            <div className={`container ${styles.container}`}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Trusted by teams <span className={styles.highlight}>everywhere</span></h2>
                </div>

                <div className={styles.grid}>
                    {testimonials.map((item, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.quoteIcon}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 11H6M10 11C10 13.2091 8.20914 15 6 15M10 11V7C10 5.89543 9.10457 5 8 5H6C4.89543 5 4 5.89543 4 7V11M4 11H6M18 11H14M18 11C18 13.2091 16.2091 15 14 15M18 11V7C18 5.89543 17.1046 5 16 5H14C12.8954 5 12 5.89543 12 7V11M12 11H14" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <p className={styles.quote}>{item.quote}</p>
                            <div className={styles.footer}>
                                <div className={styles.avatar}>{item.avatar}</div>
                                <div className={styles.info}>
                                    <div className={styles.author}>{item.author}</div>
                                    <div className={styles.role}>{item.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
