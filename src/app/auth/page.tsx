'use client';

import { useState, useEffect, Suspense } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signOut,
    signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './auth.module.css';
import { useAuth } from '@/context/AuthContext';

function AuthContent() {
    const { user, loading: authLoading } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!authLoading && user) {
            const callback = searchParams?.get('callback');
            if (callback === '/checkout/pro') {
                window.location.href = 'https://buy.stripe.com/test_5kQeVc0tt95SgIz6Ip5Vu01';
            } else {
                router.push('/dashboard');
            }
        }
    }, [user, authLoading, router, searchParams]);

    useEffect(() => {
        const unverified = searchParams?.get('unverified');
        const emailParam = searchParams?.get('email');
        if (unverified === 'true' && emailParam) {
            setUnverifiedEmail(emailParam);
            setVerificationSent(true);
        }
    }, [searchParams]);

    if (authLoading || user) {
        return (
            <div className={styles.authPage}>
                <div className="grid-bg"></div>
                <div style={{ color: 'var(--muted)', fontSize: '1.1rem', fontWeight: 600 }}>
                    Authenticating...
                </div>
            </div>
        );
    }

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            const callback = searchParams?.get('callback');
            if (callback === '/checkout/pro') {
                window.location.href = 'https://buy.stripe.com/test_5kQeVc0tt95SgIz6Ip5Vu01';
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error('Google Auth error:', err.code);
            if (err.code !== 'auth/popup-closed-by-user') {
                setError('An error occurred during Google Sign-In');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                if (!user.emailVerified) {
                    setUnverifiedEmail(user.email || '');
                    setVerificationSent(true);
                    await signOut(auth);
                } else {
                    const callback = searchParams?.get('callback');
                    if (callback === '/checkout/pro') {
                        window.location.href = 'https://buy.stripe.com/test_5kQeVc0tt95SgIz6Ip5Vu01';
                    } else {
                        router.push('/dashboard');
                    }
                }
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await sendEmailVerification(user);
                setUnverifiedEmail(user.email || '');
                setVerificationSent(true);

                // Immediately sign out to prevent auto-login as per requirements
                await signOut(auth);
            }
        } catch (err: any) {
            console.error('Auth error:', err.code);
            if (isLogin) {
                if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-email') {
                    setError('Email or password is incorrect');
                } else {
                    setError('An error occurred during sign in');
                }
            } else {
                if (err.code === 'auth/email-already-in-use') {
                    setError('User already exists. Please sign in');
                } else if (err.code === 'auth/invalid-email') {
                    setError('Please enter a valid email address');
                } else if (err.code === 'auth/weak-password') {
                    setError('Password should be at least 6 characters');
                } else {
                    setError('An error occurred during sign up');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    if (verificationSent) {
        return (
            <div className={styles.authPage}>
                <div className="grid-bg"></div>
                <div className={styles.card}>
                    <div className={styles.logo}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L3 7V12C3 17.41 6.84 22.38 12 24C17.16 22.38 21 17.41 21 12V7L12 2Z" fill="#008a5c" fillOpacity="0.2" />
                            <path d="M12 4.41L19 8.3V12C19 16.32 16.03 20.25 12 21.59C7.97 20.25 5 16.32 5 12V8.3L12 4.41ZM12 2L3 7V12C3 17.41 6.84 22.38 12 24C17.16 22.38 21 17.41 21 12V7L12 2Z" fill="#008a5c" />
                        </svg>
                        <span>Stora</span>
                    </div>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Verify your email</h1>
                        <p className={styles.subtitle}>
                            We have sent you a verification email to <strong>{unverifiedEmail}</strong>. Please verify it and log in.
                        </p>
                    </div>
                    <button
                        className={styles.submitBtn}
                        onClick={() => {
                            setVerificationSent(false);
                            setIsLogin(true);
                            router.replace('/auth');
                        }}
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.authPage}>
            <div className="grid-bg"></div>
            <div className={styles.card}>
                <div className={styles.logo}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L3 7V12C3 17.41 6.84 22.38 12 24C17.16 22.38 21 17.41 21 12V7L12 2Z" fill="#008a5c" fillOpacity="0.2" />
                        <path d="M12 4.41L19 8.3V12C19 16.32 16.03 20.25 12 21.59C7.97 20.25 5 16.32 5 12V8.3L12 4.41ZM12 2L3 7V12C3 17.41 6.84 22.38 12 24C17.16 22.38 21 17.41 21 12V7L12 2Z" fill="#008a5c" />
                    </svg>
                    <span>Stora</span>
                </div>

                <div className={styles.header}>
                    <h1 className={styles.title}>{isLogin ? 'Welcome back' : 'Create account'}</h1>
                    <p className={styles.subtitle}>
                        {isLogin ? 'Sign in to access your secure workspace' : 'Get started with enterprise-grade protection'}
                    </p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <button
                    className={styles.googleBtn}
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                >
                    <svg className={styles.googleIcon} viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <div className={styles.separator}>
                    <div className={styles.dividerLine}></div>
                    <span className={styles.separatorText}>OR</span>
                    <div className={styles.dividerLine}></div>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            className={styles.input}
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            className={styles.input}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className={styles.submitBtn} type="submit" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div className={styles.toggleAuth}>
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                        className={styles.toggleLink}
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                    >
                        {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={null}>
            <AuthContent />
        </Suspense>
    );
}
