import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Ban, 
  Truck, 
  PackageCheck 
} from 'lucide-react';
import type { Order } from '@/types';
import { formatDateTime } from '@/lib/format';

interface OrderTimelineProps {
  order: Order;
  className?: string;
}

interface TimelineStep {
  title: string;
  description: string;
  timestamp?: string;
  status: 'complete' | 'current' | 'upcoming' | 'failed';
  icon: typeof Clock;
}

export function OrderTimeline({ order, className = '' }: OrderTimelineProps) {
  const { status, createdAt, updatedAt } = order;

  const isRejected = status === 'rejected';
  const isCancelled = status === 'cancelled';

  // Build the list of stages
  const steps: TimelineStep[] = [
    {
      title: 'Order Placed',
      description: 'Buyer submitted reservation for harvest produce.',
      timestamp: createdAt,
      status: 'complete',
      icon: Clock,
    },
  ];

  if (isRejected) {
    steps.push({
      title: 'Order Rejected',
      description: 'Farmer declined the order. Reserved stock returned.',
      timestamp: updatedAt !== createdAt ? updatedAt : undefined,
      status: 'failed',
      icon: XCircle,
    });
  } else if (isCancelled) {
    steps.push({
      title: 'Order Cancelled',
      description: 'Buyer cancelled the reservation before dispatch.',
      timestamp: updatedAt !== createdAt ? updatedAt : undefined,
      status: 'failed',
      icon: Ban,
    });
  } else {
    // Normal happy path: Placed -> Confirmed -> Completed
    steps.push({
      title: 'Farmer Accepted',
      description:
        status === 'pending'
          ? 'Waiting for farmer review and lot preparation.'
          : 'Farmer accepted consignment for delivery.',
      timestamp: status === 'confirmed' || status === 'completed' ? updatedAt : undefined,
      status:
        status === 'completed'
          ? 'complete'
          : status === 'confirmed'
          ? 'current'
          : 'upcoming',
      icon: status === 'confirmed' || status === 'completed' ? CheckCircle2 : Clock,
    });

    steps.push({
      title: 'Dispatched & Completed',
      description:
        status === 'completed'
          ? 'Consignment delivered and transaction finalized.'
          : 'Pending dispatch and handover to buyer.',
      timestamp: status === 'completed' ? updatedAt : undefined,
      status: status === 'completed' ? 'complete' : 'upcoming',
      icon: status === 'completed' ? PackageCheck : Truck,
    });
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
        Order Progress Timeline
      </h4>

      <div className="relative pl-6">
        {/* Continuous vertical line connecting steps */}
        <div
          className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-stone-200 dark:bg-stone-700"
          aria-hidden="true"
        />

        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;

            const iconColors = {
              complete: 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/60',
              current: 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950/60 animate-pulse',
              upcoming: 'bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-400',
              failed: 'bg-red-600 text-white ring-4 ring-red-100 dark:ring-red-950/60',
            };

            return (
              <div key={index} className="relative flex items-start gap-4">
                {/* Node icon */}
                <div
                  className={`absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow-xs ${iconColors[step.status]}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>

                {/* Step content */}
                <div className="flex-1">
                  <div className="flex flex-col justify-between sm:flex-row sm:items-baseline">
                    <h5
                      className={`text-sm font-bold ${
                        step.status === 'failed'
                          ? 'text-red-600 dark:text-red-400'
                          : step.status === 'current'
                          ? 'text-blue-700 dark:text-blue-400'
                          : 'text-stone-900 dark:text-stone-100'
                      }`}
                    >
                      {step.title}
                    </h5>
                    {step.timestamp && (
                      <span className="text-xs text-stone-500 dark:text-stone-400">
                        {formatDateTime(step.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-400">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
