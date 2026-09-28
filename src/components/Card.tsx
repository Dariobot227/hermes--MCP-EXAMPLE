import type { Run } from '../lib/board-data';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { GripVertical, Clock, Cpu } from 'lucide-react';
import { cn, formatDuration, formatTimestamp } from '../lib/utils';

interface CardProps {
  run: Run;
  onClick: () => void;
}

export function Card({ run, onClick }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: run.id });

  const style = transform && transition ? {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  } : {
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative bg-card rounded-lg border border-border shadow-sm p-4 cursor-pointer transition-all duration-150',
        'hover:shadow-md hover:border-foreground/20',
        isDragging && 'opacity-50 shadow-lg rotate-1',
        listeners && 'active:scale-[0.98]',
      )}
      onClick={onClick}
    >
      {/* Drag handle */}
      <button
        className="absolute top-1/2 -left-1 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Content */}
      <div className="pr-6 space-y-2.5">
        {/* Run ID + Agent */}
        <div className="flex items-center justify-between">
          <span className="px-1.5 py-0.5 text-xs font-mono font-medium bg-muted rounded text-muted-foreground">
            {run.id}
          </span>
          <span className="text-xs text-muted-foreground">{run.agentName}</span>
        </div>

        {/* Summary */}
        <p className="text-sm text-foreground leading-relaxed line-clamp-2">{run.summary}</p>

        {/* Footer: status badge + time */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <Cpu
              className={cn(
                'w-3 h-3',
                run.status === 'queued' && 'text-gray-500',
                run.status === 'running' && 'text-blue-500 animate-pulse',
                run.status === 'completed' && 'text-green-500',
                run.status === 'failed' && 'text-red-500',
                run.status === 'blocked' && 'text-amber-500',
              )}
            />
            <span className={cn(
              'text-xs font-medium capitalize',
              run.status === 'queued' && 'text-gray-600',
              run.status === 'running' && 'text-blue-600',
              run.status === 'completed' && 'text-green-600',
              run.status === 'failed' && 'text-red-600',
              run.status === 'blocked' && 'text-amber-600',
            )}>
              {run.status}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{run.status === 'running' ? 'Running' : formatTimestamp(run.startedAt)}</span>
          </div>
        </div>

        {/* Duration for completed/failed */}
        {run.durationMs !== null && (
          <div className="text-xs text-muted-foreground">
            {formatDuration(run.durationMs)}
          </div>
        )}
      </div>
    </div>
  );
}
