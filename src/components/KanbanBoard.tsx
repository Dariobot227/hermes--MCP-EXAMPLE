import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import type { Run, RunStatus } from '../lib/board-data';
import { getAgents, getRuns } from '../lib/board-data';
import { Column } from './Column';
import { Card } from './Card';
import { FilterBar } from './FilterBar';
import { CardDetail } from './CardDetail';

const COLUMNS: { id: RunStatus; title: string }[] = [
  { id: 'queued', title: 'Queued' },
  { id: 'running', title: 'Running' },
  { id: 'completed', title: 'Completed' },
  { id: 'failed', title: 'Failed' },
  { id: 'blocked', title: 'Blocked' },
];

export function KanbanBoard() {
  const [runs, setRuns] = useState<Run[]>(() => getRuns());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<RunStatus>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [mobileColumnId, setMobileColumnId] = useState<RunStatus>('queued');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const agents = getAgents(runs);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeRun = runs.find(r => r.id === active.id);
    if (!activeRun) return;

    // Determine target status
    let targetStatus: RunStatus | null = null;

    if (typeof over.id === 'string') {
      const columnIds = COLUMNS.map(c => c.id);
      if (columnIds.includes(over.id as RunStatus)) {
        targetStatus = over.id as RunStatus;
      } else {
        const overRun = runs.find(r => r.id === over.id);
        if (overRun) targetStatus = overRun.status;
      }
    }

    if (targetStatus && activeRun.status !== targetStatus) {
      setRuns(prev =>
        prev.map(r =>
          r.id === active.id
            ? {
                ...r,
                status: targetStatus,
                statusHistory: [
                  ...r.statusHistory,
                  { status: targetStatus, timestamp: new Date() },
                ],
              }
            : r
        )
      );
    }
  }, [runs]);

  // Filtered runs
  const filteredRuns = runs.filter(run => {
    if (selectedStatuses.size > 0 && !selectedStatuses.has(run.status)) return false;
    if (selectedAgents.size > 0 && !selectedAgents.has(run.agentName)) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (!run.summary.toLowerCase().includes(query) &&
          !run.id.toLowerCase().includes(query) &&
          !run.agentName.toLowerCase().includes(query)) return false;
    }
    return true;
  });

  const getColumnRuns = (status: RunStatus): Run[] => {
    return filteredRuns.filter(r => r.status === status);
  };

  const handleAgentToggle = useCallback((agent: string) => {
    setSelectedAgents(prev => {
      const next = new Set(prev);
      if (next.has(agent)) next.delete(agent);
      else next.add(agent);
      return next;
    });
  }, []);

  const handleStatusToggle = useCallback((status: RunStatus) => {
    setSelectedStatuses(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedAgents(new Set());
    setSelectedStatuses(new Set());
    setSearchQuery('');
  }, []);

  const activeRun = activeId ? runs.find(r => r.id === activeId) : null;
  const selectedRun = selectedRunId ? runs.find(r => r.id === selectedRunId) : null;

  const handleRetry = useCallback(() => {
    if (!selectedRun) return;
    setRuns(prev =>
      prev.map(r =>
        r.id === selectedRun.id
          ? {
              ...r,
              status: 'queued',
              statusHistory: [
                ...r.statusHistory,
                { status: 'queued', timestamp: new Date() },
              ],
            }
          : r
      )
    );
    setSelectedRunId(null);
  }, [selectedRun]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <h1 className="text-lg font-semibold text-foreground">Agent Run Board</h1>
              </div>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {runs.length} total runs
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <FilterBar
          agents={agents}
          selectedAgents={selectedAgents}
          selectedStatuses={selectedStatuses}
          searchQuery={searchQuery}
          onAgentToggle={handleAgentToggle}
          onStatusToggle={handleStatusToggle}
          onSearchChange={setSearchQuery}
          onClearAll={handleClearAll}
        />
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
          {isMobileMode ? (
            /* Mobile: single column with segmented control */
            <div className="space-y-3">
              {/* Segmented control */}
              <div className="flex gap-1 p-1 bg-muted/50 rounded-xl overflow-x-auto">
                {COLUMNS.map(col => (
                  <button
                    key={col.id}
                    onClick={() => setMobileColumnId(col.id)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                      mobileColumnId === col.id
                        ? 'bg-background text-foreground shadow-sm border'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {col.title}
                    <span className="ml-1.5 text-xs opacity-60">
                      ({getColumnRuns(col.id).length})
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => setIsMobileMode(false)}
                  className="px-2 py-2 text-sm text-muted-foreground hover:text-foreground ml-1 flex-shrink-0"
                  aria-label="Switch to desktop view"
                >
                  <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Single column view */}
              <Column
                id={mobileColumnId}
                title={COLUMNS.find(c => c.id === mobileColumnId)?.title ?? ''}
                runs={getColumnRuns(mobileColumnId)}
                isEmpty={getColumnRuns(mobileColumnId).length === 0}
              />
            </div>
          ) : (
            /* Desktop: 5 columns */
            <div className="grid grid-cols-5 gap-3 h-[calc(100vh-220px)] overflow-x-auto pb-2">
              {COLUMNS.map(col => (
                <div key={col.id} className="flex flex-col min-w-[240px] max-w-[280px]">
                  <Column
                    id={col.id}
                    title={col.title}
                    runs={getColumnRuns(col.id)}
                    isEmpty={getColumnRuns(col.id).length === 0}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeRun ? (
            <div className="opacity-80 rotate-2 shadow-2xl scale-105">
              <Card run={activeRun} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Card detail panel */}
      {selectedRun && (
        <CardDetail
          run={selectedRun}
          onClose={() => setSelectedRunId(null)}
          onRetry={handleRetry}
        />
      )}

      {/* Mobile toggle - fixed bottom */}
      {!isMobileMode && (
        <button
          onClick={() => setIsMobileMode(true)}
          className="fixed bottom-4 right-4 z-40 p-2.5 bg-secondary text-secondary-foreground rounded-full shadow-lg hover:bg-secondary/80 transition-colors sm:hidden"
          aria-label="Switch to mobile view"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V3a4 4 0 014-4h4a4 4 0 014 4v14a4 4 0 01-4 4zm0 0h10a2 2 0 002-2v-7m0 0H7" />
          </svg>
        </button>
      )}
    </div>
  );
}
