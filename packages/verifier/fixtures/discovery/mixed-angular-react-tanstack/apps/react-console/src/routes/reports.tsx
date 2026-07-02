import { createFileRoute } from '@tanstack/react-router';
import { RevenueChart } from '../features/billing/RevenueChart';

export const Route = createFileRoute('/reports')({
  component: ReportsRoute,
});

function ReportsRoute() {
  return <RevenueChart />;
}
