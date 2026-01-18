import styles from './FAQ.module.css';

const faqs = [
    {
        question: "How does Stora protect my data?",
        answer: "We use AES-256 encryption at rest and TLS 1.3 for data in transit. Your keys are managed via hardware security modules (HSMs)."
    },
    {
        question: "Can I manage team permissions easily?",
        answer: "Yes, our granular permission system allows you to define roles for every folder, file, and dashboard with just a few clicks."
    },
    {
        question: "Do you offer enterprise-level support?",
        answer: "Our Enterprise plan includes a dedicated account manager, 24/7 priority support, and a guaranteed 99.99% uptime SLA."
    },
    {
        question: "Is there a free trial for the Pro plan?",
        answer: "Yes, you can try the Pro plan for 14 days with no credit card required. After that, you can choose to upgrade or stick to the free plan."
    }
];

const FAQ = () => {
    return (
        <section className={styles.faq} id="support">
            <div className={`container ${styles.container}`}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Frequently Asked <span className={styles.highlight}>Questions</span></h2>
                    <p className={styles.subtitle}>Everything you need to know about Stora and our security practices.</p>
                </div>

                <div className={styles.grid}>
                    {faqs.map((faq, index) => (
                        <div key={index} className={styles.item}>
                            <h3 className={styles.question}>{faq.question}</h3>
                            <p className={styles.answer}>{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
