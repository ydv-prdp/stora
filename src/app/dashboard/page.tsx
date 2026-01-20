import { Suspense } from 'react';
import DashboardContent from './DashboardContent';

// Force dynamic rendering to prevent static generation during build
// This page requires client-side features: auth, Firebase, search params
export const dynamic = 'force-dynamic';

export default function Dashboard() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
            <DashboardContent />
        </Suspense>
    );
}
