import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Code,
  Shield,
  AlertTriangle,
  Copy,
  CheckCircle,
  Filter,
  BookOpen,
  Lightbulb,
  Star,
  Tag,
  Clock,
  TrendingUp,
  X
} from 'lucide-react';
import { 
  SecureCodeSearchService, 
  SearchResult, 
  SearchFilters, 
  CodeSnippet 
} from '@/services/secureCodeSearchService';
import { toast } from 'sonner';

interface SecureCodeSearchCardProps {
  language?: string;
  framework?: string;
  vulnerabilityType?: string;
  className?: string;
}

export const SecureCodeSearchCard: React.FC<SecureCodeSearchCardProps> = ({
  language,
  framework,
  vulnerabilityType,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    language,
    framework,
    vulnerabilityType
  });
  const [showFilters, setShowFilters] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchService] = useState(() => new SecureCodeSearchService());
  const [categories, setCategories] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [frameworks, setFrameworks] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const initializeData = useCallback(async () => {
    setCategories(searchService.getCategories() || []);
    setLanguages(searchService.getLanguages() || []);
    setFrameworks(searchService.getFrameworks() || []);
    setTags(searchService.getTags() || []);
  }, [searchService]);

  const performSearch = useCallback(async (query: string = searchQuery) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchService.searchSnippets(query, filters, 20);
      setSearchResults(results || []);
    } catch (error) {
      toast.error('Search failed');
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, searchService, filters]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    if (vulnerabilityType) {
      performSearch(vulnerabilityType);
    }
  }, [vulnerabilityType, performSearch]);





  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const copyToClipboard = async (code: string, title: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(title);
      toast.success(`Code snippet "${title}" copied to clipboard`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'secure': return 'bg-green-100 text-green-800 border-green-200';
      case 'insecure': return 'bg-red-100 text-red-800 border-red-200';
      case 'improved': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchResults([]);
  };

  const updateFilter = (key: keyof SearchFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: (value === 'all' || !value) ? undefined : value
    }));
  };

  return (
    <Card className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-600" />
          Secure Code Search Engine
          <Badge variant="outline" className="text-blue-600 border-blue-300">
            Pattern Library
          </Badge>
        </CardTitle>
        <CardDescription>
          Search for secure code implementations and learn from security best practices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search for secure code patterns, vulnerabilities, or implementations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Filter search results"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Select value={filters.language || 'all'} onValueChange={(value) => updateFilter('language', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages?.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.framework || 'all'} onValueChange={(value) => updateFilter('framework', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frameworks</SelectItem>
                  {frameworks?.map(fw => (
                    <SelectItem key={fw} value={fw}>{fw}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.category || 'all'} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.securityLevel || 'all'} onValueChange={(value) => updateFilter('securityLevel', value as 'secure' | 'insecure' | 'improved' | undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Security Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="secure">Secure</SelectItem>
                  <SelectItem value="insecure">Insecure</SelectItem>
                  <SelectItem value="improved">Improved</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>
          )}
        </form>

        {/* Search Results */}
        {searchResults && searchResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Search Results ({searchResults.length})
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <TrendingUp className="h-4 w-4" />
                Sorted by relevance
              </div>
            </div>

            <div className="space-y-4">
              {searchResults?.map((result, index) => (
                <Card key={result.snippet.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSecurityLevelColor(result.snippet.securityLevel)}>
                            {result.snippet.securityLevel === 'secure' && <Shield className="h-3 w-3 mr-1" />}
                            {result.snippet.securityLevel === 'insecure' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {result.snippet.securityLevel === 'improved' && <Lightbulb className="h-3 w-3 mr-1" />}
                            {result.snippet.securityLevel}
                          </Badge>
                          <Badge variant="outline">{result.snippet.language}</Badge>
                          {result.snippet.framework && (
                            <Badge variant="outline">{result.snippet.framework}</Badge>
                          )}
                          <Badge className={getDifficultyColor(result.snippet.difficulty)}>
                            {result.snippet.difficulty}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Star className="h-3 w-3" />
                            {Math.round(result.relevanceScore)}% match
                          </div>
                        </div>
                        <CardTitle className="text-lg">{result.snippet.title}</CardTitle>
                        <CardDescription>{result.snippet.description}</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(result.snippet.code, result.snippet.title)}
                      >
                        {copiedCode === result.snippet.title ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="code" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="code">Code</TabsTrigger>
                        <TabsTrigger value="explanation">Explanation</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                      </TabsList>

                      <TabsContent value="code" className="space-y-2">
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code dangerouslySetInnerHTML={{ __html: result.highlightedCode }} />
                        </pre>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Code className="h-4 w-4" />
                          Use Case: {result.snippet.useCase}
                        </div>
                      </TabsContent>

                      <TabsContent value="explanation" className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Security Explanation
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {result.snippet.explanation}
                          </p>
                        </div>

                        {result.snippet.alternatives && result.snippet.alternatives.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Alternative Approaches</h4>
                            <div className="flex flex-wrap gap-2">
                              {result.snippet.alternatives.map((alt, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {alt}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="details" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Security Information</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Category:</span>
                                <Badge variant="outline">{result.snippet.category}</Badge>
                              </div>
                              {result.snippet.cweId && (
                                <div className="flex justify-between">
                                  <span>CWE ID:</span>
                                  <span className="text-slate-600 dark:text-slate-400">{result.snippet.cweId}</span>
                                </div>
                              )}
                              {result.snippet.owaspCategory && (
                                <div className="flex justify-between">
                                  <span>OWASP:</span>
                                  <span className="text-slate-600 dark:text-slate-400">{result.snippet.owaspCategory}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Metadata</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span>Updated: {result.snippet.lastUpdated.toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Tag className="h-3 w-3" />
                                <span>Tags: {result.snippet.tags.length}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {result.snippet.tags.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                              {result.snippet.tags.map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchQuery && searchResults && searchResults.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              No secure code patterns found for "{searchQuery}"
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Try different keywords or adjust your filters
            </p>
          </div>
        )}

        {/* Initial State */}
        {!searchQuery && (!searchResults || searchResults.length === 0) && (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              Search for secure code patterns and implementations
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Find examples of secure coding practices, vulnerability fixes, and best practices
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
