import type { RunStatus } from '../lib/board-data';
import { Search, X } from 'lucide-react';
import { cn } from '../lib/utils';

const statusLabels: Record<RunStatus, string> = {
  queued: 'Queued',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
  blocked: 'Blocked',
};

interface FilterBarProps {
  agents: string[];
  selectedAgents: Set<string>;
  selectedStatuses: Set<RunStatus>;
  searchQuery: string;
  onAgentToggle: (agent: string) => void;
  onStatusToggle: (status: RunStatus) => void;
  onSearchChange: (query: string) => void;
  onClearAll: () => void;
}

export function FilterBar({
  agents,
  selectedAgents,
  selectedStatuses,
  searchQuery,
  onAgentToggle,
  onStatusToggle,
  onSearchChange,
  onClearAll,
}: FilterBarProps) {
  const hasActiveFilters = selectedAgents.size > 0 || selectedStatuses.size > 0 || searchQuery.trim().length > 0;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className={cn(
            'w-full pl-9 pr-9 py-2 text-sm bg-background border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors',
          )}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter chips row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Status toggles */}
        <div className="flex flex-wrap items-center gap-1.5">
          {Object.entries(statusLabels).map(([status, label]) => {
            const isActive = selectedStatuses.has(status as RunStatus);
            return (
              <button
                key={status}
                onClick={() => onStatusToggle(status as RunStatus)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors',
                  isActive
                    ? 'bg-primary/10 border-primary/50 text-primary'
                    : 'bg-background border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    isActive
                      ? 'bg-primary'
                      : status === 'queued' && 'bg-gray-400',
                      status === 'running' && !isActive && 'bg-blue-400',
                      status === 'completed' && !isActive && 'bg-green-400',
                      status === 'failed' && !isActive && 'bg-red-400',
                      status === 'blocked' && !isActive && 'bg-amber-400',
                  )}
                />
                {label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <span className="w-px h-5 bg-border mx-1" />

        {/* Agent chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {agents.map(agent => {
            const isActive = selectedAgents.has(agent);
            return (
              <button
                key={agent}
                onClick={() => onAgentToggle(agent)}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-full border transition-colors',
                  isActive
                    ? 'bg-secondary border-secondary/50 text-secondary-foreground'
                    : 'bg-background border-border text-muted-foreground hover:border-foreground/30',
                )}
              >
                {agent}
              </button>
            );
          })}
        </div>

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-red-500 transition-colors ml-auto"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Active filter summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="text-foreground font-medium">Filtering:</span>
          {selectedStatuses.size > 0 && (
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded">
              {selectedStatuses.size} status{selectedStatuses.size > 1 ? 'es' : ''}
            </span>
          )}
          {selectedAgents.size > 0 && (
            <span className="px-1.5 py-0.5 bg-secondary/10 text-secondary-foreground rounded">
              {selectedAgents.size} agent{selectedAgents.size > 1 ? 's' : ''}
            </span>
          )}
          {searchQuery.trim() && (
            <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
              &quot;{searchQuery.trim()}&quot;
            </span>
          )}
        </div>
      )}
    </div>
  );
}
