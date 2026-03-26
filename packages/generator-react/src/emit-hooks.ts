// AUTO: Generates custom React hooks for wired page state management.
// Each hook type encapsulates a specific domain of page-level state
// (search, filters, selection, sort) with typed interfaces.

import type { IRHookType, GeneratedFile } from '@decantr/generator-core';

// AUTO: Hook metadata used by emit-page to generate typed props and imports
export interface HookMeta {
  hookType: IRHookType;
  fileName: string;
  hookName: string;
  typeName: string;
  variableName: string;
}

export const HOOK_REGISTRY: Record<IRHookType, HookMeta> = {
  search: {
    hookType: 'search',
    fileName: 'usePageSearch',
    hookName: 'usePageSearch',
    typeName: 'PageSearchState',
    variableName: 'search',
  },
  filter: {
    hookType: 'filter',
    fileName: 'usePageFilters',
    hookName: 'usePageFilters',
    typeName: 'PageFiltersState',
    variableName: 'filters',
  },
  selection: {
    hookType: 'selection',
    fileName: 'usePageSelection',
    hookName: 'usePageSelection',
    typeName: 'PageSelectionState',
    variableName: 'selection',
  },
  sort: {
    hookType: 'sort',
    fileName: 'usePageSort',
    hookName: 'usePageSort',
    typeName: 'PageSortState',
    variableName: 'sort',
  },
};

function emitUsePageSearch(): GeneratedFile {
  const content = `import { useCallback, useEffect, useRef, useState } from 'react';

export interface PageSearchState {
  search: string;
  setSearch: (value: string) => void;
  debouncedSearch: string;
  clearSearch: () => void;
}

export function usePageSearch(initialValue = ''): PageSearchState {
  const [search, setSearch] = useState(initialValue);
  const [debouncedSearch, setDebouncedSearch] = useState(initialValue);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [search]);

  const clearSearch = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
  }, []);

  return { search, setSearch, debouncedSearch, clearSearch };
}
`;
  return { path: 'src/hooks/usePageSearch.ts', content };
}

function emitUsePageFilters(): GeneratedFile {
  const content = `import { useCallback, useState } from 'react';

export interface PageFiltersState {
  filters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

const EMPTY_FILTERS: Record<string, string> = {};

export function usePageFilters(): PageFiltersState {
  const [filters, setFilters] = useState<Record<string, string>>(EMPTY_FILTERS);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFilters(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  const activeFilterCount = Object.keys(filters).length;

  return { filters, setFilter, removeFilter, clearFilters, activeFilterCount };
}
`;
  return { path: 'src/hooks/usePageFilters.ts', content };
}

function emitUsePageSelection(): GeneratedFile {
  const content = `import { useCallback, useState } from 'react';

export interface PageSelectionState {
  selected: string[];
  select: (id: string) => void;
  deselect: (id: string) => void;
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
}

const EMPTY_SELECTION: string[] = [];

export function usePageSelection(): PageSelectionState {
  const [selected, setSelected] = useState<string[]>(EMPTY_SELECTION);

  const select = useCallback((id: string) => {
    setSelected(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const deselect = useCallback((id: string) => {
    setSelected(prev => prev.filter(s => s !== id));
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id],
    );
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelected(ids);
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(EMPTY_SELECTION);
  }, []);

  const isSelected = useCallback(
    (id: string) => selected.includes(id),
    [selected],
  );

  return { selected, select, deselect, toggleSelect, selectAll, clearSelection, isSelected };
}
`;
  return { path: 'src/hooks/usePageSelection.ts', content };
}

function emitUsePageSort(): GeneratedFile {
  const content = `import { useCallback, useState } from 'react';

export interface PageSortState {
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  setSort: (column: string, direction: 'asc' | 'desc') => void;
  toggleSort: (column: string) => void;
}

export function usePageSort(): PageSortState {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const setSort = useCallback((column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
  }, []);

  const toggleSort = useCallback((column: string) => {
    setSortColumn(prevColumn => {
      setSortDirection(prevDir =>
        prevColumn === column ? (prevDir === 'asc' ? 'desc' : 'asc') : 'asc',
      );
      return column;
    });
  }, []);

  return { sortColumn, sortDirection, setSort, toggleSort };
}
`;
  return { path: 'src/hooks/usePageSort.ts', content };
}

const HOOK_EMITTERS: Record<IRHookType, () => GeneratedFile> = {
  search: emitUsePageSearch,
  filter: emitUsePageFilters,
  selection: emitUsePageSelection,
  sort: emitUsePageSort,
};

/** Emit hook files for only the hook types actually needed across all pages */
export function emitHooks(hookTypes: Set<IRHookType>): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  for (const hookType of hookTypes) {
    const emitter = HOOK_EMITTERS[hookType];
    if (emitter) {
      files.push(emitter());
    }
  }
  return files;
}
