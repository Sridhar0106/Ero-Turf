import { motion } from 'framer-motion';
import CricketLoader from './CricketLoader';

export default function LoadingSkeleton({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} style={{ minHeight: 20 }} />;
}

export function CardSkeleton() {
  return (
    <div className="glass p-6 space-y-4">
      <LoadingSkeleton className="h-6 w-2/3" />
      <LoadingSkeleton className="h-4 w-full" />
      <LoadingSkeleton className="h-4 w-4/5" />
      <div className="flex gap-3 pt-2">
        <LoadingSkeleton className="h-9 w-24 rounded-xl" />
        <LoadingSkeleton className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export function SlotSkeleton() {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <LoadingSkeleton key={i} className="h-12 rounded-xl" />
      ))}
    </div>
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="glass p-5 space-y-3">
      <div className="flex justify-between items-start">
        <LoadingSkeleton className="h-5 w-3/5" />
        <LoadingSkeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex justify-between items-center py-3">
        <div className="space-y-2">
          <LoadingSkeleton className="h-4 w-24" />
          <LoadingSkeleton className="h-8 w-28" />
        </div>
        <LoadingSkeleton className="h-6 w-8" />
        <div className="space-y-2">
          <LoadingSkeleton className="h-4 w-24" />
          <LoadingSkeleton className="h-8 w-28" />
        </div>
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-white">
      <CricketLoader message="" />
    </div>
  );
}
