import { useEffect, useRef } from 'react';
import { X, RotateCcw } from 'lucide-react';
import type { Run } from '../lib/board-data';
import { cn, formatDuration, formatTimestamp } from '../lib/utils';

interface CardDetailProps {
  run: Run;
  onClose: () => void;
  onRetry: () => void;
}

export function CardDetail({ run, onClose, onRetry }: CardDetailProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const canRetry = run.status === 'failed' || run.status === 'blocked';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-lg bg-background shadow-xl rounded-t-2xl sm:rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Run details"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
              {run.id}
            </span>
            <span className="text-sm text-muted-foreground">{run.agentName}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Summary */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Task Summary</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{run.summary}</p>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Status</h3>
            <div className="flex items-center gap-2">
              <span className={cn(
                'px-2.5 py-0.5 text-xs font-medium rounded-full',
                run.status === 'queued' && 'bg-gray-100 text-gray-700',
                run.status === 'running' && 'bg-blue-100 text-blue-700',
                run.status === 'completed' && 'bg-green-100 text-green-700',
                run.status === 'failed' && 'bg-red-100 text-red-700',
                run.status === 'blocked' && 'bg-amber-100 text-amber-700',
              )}>
                {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Status History */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Status History</h3>
            <div className="space-y-1.5">
              {run.statusHistory.map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'w-2 h-2 rounded-full',
                      entry.status === 'queued' && 'bg-gray-400',
                      entry.status === 'running' && 'bg-blue-500',
                      entry.status === 'completed' && 'bg-green-500',
                      entry.status === 'failed' && 'bg-red-500',
                      entry.status === 'blocked' && 'bg-amber-500',
                    )} />
                    <span className="capitalize text-foreground">{entry.status}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Timing */}
          {(run.durationMs !== null || run.completedAt !== null) && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Timing</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Started</span>
                  <p className="text-foreground mt-0.5">{formatTimestamp(run.startedAt)}</p>
                </div>
                {run.completedAt && (
                  <div>
                    <span className="text-muted-foreground">Finished</span>
                    <p className="text-foreground mt-0.5">{formatTimestamp(run.completedAt)}</p>
                  </div>
                )}
                {run.durationMs !== null && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Duration</span>
                    <p className="text-foreground mt-0.5">{formatDuration(run.durationMs)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Token Usage */}
          {run.tokenUsage !== null && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Token Usage</h3>
              <p className="text-foreground text-sm">{run.tokenUsage.toLocaleString()} tokens</p>
            </div>
          )}

          {/* Retry Button */}
          <div className="pt-2">
            <button
              onClick={onRetry}
              disabled={!canRetry}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors',
                canRetry
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              )}
            >
              <RotateCcw className="w-4 h-4" />
              {canRetry ? 'Retry Run' : 'Not Available'}
            </button>
            {!canRetry && (
              <p className="text-xs text-muted-foreground text-center mt-1.5">
                Retry is only available for Failed and Blocked runs
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
