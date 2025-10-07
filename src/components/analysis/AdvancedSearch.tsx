import React, { useState, useCallback, useMemo } from 'react';
import { Search, Filter, X, ChevronDown, SortAsc, SortDesc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface SearchFilters {
  query: string;
  severity: string[];
  type: string[];
  file: string[];
  sortBy: 'severity' | 'type' | 'file' | 'line';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  availableFilters: {
    severities: string[];
    types: string[];
    files: string[];
  };
  resultCount: number;
  className?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onFiltersChange,
  availableFilters,
  resultCount,
  className = '',
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    severity: [],
    type: [],
    file: [],
    sortBy: 'severity',
    sortOrder: 'desc',
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  }, [filters, onFiltersChange]);

  const handleQueryChange = useCallback((query: string) => {
    updateFilters({ query });
  }, [updateFilters]);

  const handleFilterToggle = useCallback((filterType: keyof Pick<SearchFilters, 'severity' | 'type' | 'file'>, value: string) => {
    const currentValues = filters[filterType];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    updateFilters({ [filterType]: newValues });
  }, [filters, updateFilters]);

  const handleSortChange = useCallback((sortBy: SearchFilters['sortBy']) => {
    updateFilters({ sortBy });
  }, [updateFilters]);

  const handleSortOrderToggle = useCallback(() => {
    updateFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
  }, [filters.sortOrder, updateFilters]);

  const clearAllFilters = useCallback(() => {
    const clearedFilters: SearchFilters = {
      query: '',
      severity: [],
      type: [],
      file: [],
      sortBy: 'severity',
      sortOrder: 'desc',
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  }, [onFiltersChange]);

  const removeFilter = useCallback((filterType: keyof Pick<SearchFilters, 'severity' | 'type' | 'file'>, value: string) => {
    handleFilterToggle(filterType, value);
  }, [handleFilterToggle]);

  const activeFilterCount = useMemo(() => {
    return filters.severity.length + filters.type.length + filters.file.length + (filters.query ? 1 : 0);
  }, [filters]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold">Search & Filter</CardTitle>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span>{resultCount} results</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search issues, files, or descriptions..."
            value={filters.query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`pl-10 pr-4 transition-all duration-200 ${
              searchFocused ? 'ring-2 ring-blue-500 border-blue-500' : ''
            }`}
            aria-label="Search issues"
          />
          {filters.query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQueryChange('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sort by:</span>
            <Select value={filters.sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="severity">Severity</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="file">File</SelectItem>
                <SelectItem value="line">Line</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSortOrderToggle}
              className="p-2"
              aria-label={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {filters.sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.query && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{filters.query}"
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQueryChange('')}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.severity.map(severity => (
              <Badge key={severity} className={`flex items-center gap-1 ${getSeverityColor(severity)}`}>
                {severity}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter('severity', severity)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {filters.type.map(type => (
              <Badge key={type} variant="outline" className="flex items-center gap-1">
                {type}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter('type', type)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {filters.file.map(file => (
              <Badge key={file} variant="outline" className="flex items-center gap-1">
                {file}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter('file', file)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Filter Panel */}
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <CollapsibleContent className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Severity Filters */}
              <div>
                <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-3">Severity</h4>
                <div className="space-y-2">
                  {availableFilters.severities.map(severity => (
                    <div key={severity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`severity-${severity}`}
                        checked={filters.severity.includes(severity)}
                        onCheckedChange={() => handleFilterToggle('severity', severity)}
                      />
                      <label
                        htmlFor={`severity-${severity}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        <Badge className={getSeverityColor(severity)} variant="secondary">
                          {severity}
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Type Filters */}
              <div>
                <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-3">Issue Type</h4>
                <div className="space-y-2">
                  {availableFilters.types.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={filters.type.includes(type)}
                        onCheckedChange={() => handleFilterToggle('type', type)}
                      />
                      <label
                        htmlFor={`type-${type}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Filters */}
              <div>
                <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-3">Files</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableFilters.files.map(file => (
                    <div key={file} className="flex items-center space-x-2">
                      <Checkbox
                        id={`file-${file}`}
                        checked={filters.file.includes(file)}
                        onCheckedChange={() => handleFilterToggle('file', file)}
                      />
                      <label
                        htmlFor={`file-${file}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer truncate"
                        title={file}
                      >
                        {file}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;
