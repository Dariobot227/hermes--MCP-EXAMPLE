import type { Run } from '../lib/board-data';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from './Card';

interface ColumnProps {
  id: string;
  title: string;
  runs: Run[];
  isEmpty: boolean;
}

const statusDotColors: Record<string, string> = {
  queued: 'bg-gray-400',
  running: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
  blocked: 'bg-amber-500',
};

export function Column({ id, title, runs, isEmpty }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={`flex flex-col h-full min-w-0 rounded-lg transition-colors ${
        isOver ? 'bg-primary/5 ring-2 ring-primary/20' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30 rounded-t-lg">
        <span className={`w-2 h-2 rounded-full ${statusDotColors[id] ?? 'bg-gray-400'}`} />
        <h3 className="font-medium text-sm text-foreground capitalize">{title}</h3>
        <span className="ml-auto text-xs text-muted-foreground font-mono px-1.5 py-0.5 bg-background rounded-full border">
          {runs.length}
        </span>
      </div>

      {/* Cards area */}
      <div ref={setNodeRef} className="flex-1 p-2 space-y-2 min-h-[120px] max-h-[calc(100vh-260px)] overflow-y-auto">
        <SortableContext items={runs.map(r => r.id)} strategy={verticalListSortingStrategy}>
          {runs.map(run => (
            <Card key={run.id} run={run} onClick={() => {}} />
          ))}
        </SortableContext>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1m16 0h-2.46" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">No {title.toLowerCase()} runs</p>
          <p className="text-xs text-muted-foreground mt-0.5">Drag a card here to move it</p>
        </div>
      )}
    </div>
  );
}
