import { Suspense } from 'react';
import { use } from 'react';
import TicketDetail from './TicketDetail';

export default function AdminTicketDetailPage({ params }: { params: { id: string } }) {
  const resolvedParams = use(Promise.resolve(params));

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <TicketDetail ticketId={resolvedParams.id} />
    </Suspense>
  );
} 