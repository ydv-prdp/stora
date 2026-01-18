'use client';

import { motion } from 'framer-motion';
import styles from './Pricing.module.css';

const plans = [
    {
        name: 'Starter',
        price: '$0',
        description: 'Perfect for small teams and personal projects.',
        features: ['Up to 5 users', '10GB storage', 'Basic security', 'Community support'],
        buttonText: 'Get Started Free',
        popular: false
    },
    {
        name: 'Pro',
        price: '$49',
        description: 'Advanced features for growing organizations.',
        features: ['Unlimited users', '500GB storage', 'Advanced permissions', 'Priority support', 'Audit logs'],
        buttonText: 'Try Pro Free',
        popular: true
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        description: 'Bespoke solutions for large-scale operations.',
        features: ['Everything in Pro', 'Unlimited storage', 'Dedicated account manager', 'SLA guarantees', 'On-premise option'],
        buttonText: 'Contact Sales',
        popular: false
    }
];

const Pricing = () => {
    return (
        <section className={styles.pricing} id="pricing">
            <div className={`container ${styles.pricingContainer}`}>
                <div className={styles.header}>
                    <h2 className={styles.sectionTitle}>Simple, <span className={styles.highlight}>transparent</span> pricing</h2>
                    <p className={styles.sectionSubtitle}>Choose the plan that fits your team's size and security needs.</p>
                </div>

                <div className={styles.grid}>
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                            viewport={{ once: true }}
                            className={`${styles.card} ${plan.popular ? styles.popular : ''}`}
                        >
                            {plan.popular && <div className={styles.popularBadge}>Most Popular</div>}
                            <div className={styles.cardHeader}>
                                <h3 className={styles.planName}>{plan.name}</h3>
                                <div className={styles.price}>{plan.price}<span className={styles.period}>{plan.price !== 'Custom' ? '/mo' : ''}</span></div>
                                <p className={styles.description}>{plan.description}</p>
                            </div>

                            <ul className={styles.featureList}>
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className={styles.featureItem}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M5 13L9 17L19 7" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button className={`${styles.button} ${plan.popular ? styles.btnPopular : ''}`}>
                                {plan.buttonText}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
