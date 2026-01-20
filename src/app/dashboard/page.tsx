import { Suspense } from 'react';
import DashboardContent from './DashboardContent';

export default function Dashboard() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
            <DashboardContent />
        </Suspense>
    );
}
