import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  ExternalLink, 
  Star, 
  GitFork,
  Eye,
  MapPin,
  Building,
  Globe,
  Github,
  Loader2
} from 'lucide-react';
import { githubService, ContributorWithDetails } from '@/services/githubService';

const GitHubContributorsSection = () => {
  const [contributors, setContributors] = useState<ContributorWithDetails[]>([]);
  const [repoStats, setRepoStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contributorsData, statsData] = await Promise.all([
          githubService.getContributorsWithDetails(),
          githubService.getRepositoryStats()
        ]);
        
        setContributors(contributorsData);
        setRepoStats(statsData);
      } catch (err) {
        setError('Failed to load GitHub data');
        console.error('Error loading GitHub data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getContributorRole = (contributions: number, index: number) => {
    if (index === 0) return 'Lead Contributor';
    if (contributions > 50) return 'Core Contributor';
    if (contributions > 20) return 'Active Contributor';
    if (contributions > 10) return 'Regular Contributor';
    return 'Contributor';
  };

  const getContributorBadgeColor = (contributions: number, index: number) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    if (contributions > 50) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (contributions > 20) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (contributions > 10) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    return 'bg-gradient-to-r from-gray-500 to-slate-500';
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading GitHub contributors...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Our GitHub Contributors
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-6">
              Meet the amazing developers who have contributed to making Code Guardian better. 
              Their dedication and expertise drive our mission forward.
            </p>
            
            {/* Repository Stats */}
            {repoStats && (
              <Card className="max-w-2xl mx-auto mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                <CardHeader>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Github className="w-6 h-6" />
                    <CardTitle className="text-2xl">Code Guardian Repository</CardTitle>
                  </div>
                  <CardDescription className="text-blue-100">
                    Open source security analysis platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="w-4 h-4" />
                        <span className="font-bold">{repoStats.stars}</span>
                      </div>
                      <p className="text-xs text-blue-100">Stars</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <GitFork className="w-4 h-4" />
                        <span className="font-bold">{repoStats.forks}</span>
                      </div>
                      <p className="text-xs text-blue-100">Forks</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Eye className="w-4 h-4" />
                        <span className="font-bold">{repoStats.watchers}</span>
                      </div>
                      <p className="text-xs text-blue-100">Watchers</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="font-bold">{contributors.length}</span>
                      </div>
                      <p className="text-xs text-blue-100">Contributors</p>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full"
                    onClick={() => window.open('https://github.com/Xenonesis/code-guardian-report', '_blank')}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    View on GitHub
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contributors Grid */}
          {contributors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {contributors.map((contributor, index) => (
                <Card key={contributor.id} className="hover:shadow-lg transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={contributor.avatar_url}
                          alt={contributor.name || contributor.login}
                          className="w-16 h-16 rounded-full border-2 border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${getContributorBadgeColor(contributor.contributions, index)} flex items-center justify-center text-white text-xs font-bold`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          {contributor.name || contributor.login}
                        </CardTitle>
                        <CardDescription className="text-blue-600 dark:text-blue-400 font-medium">
                          {getContributorRole(contributor.contributions, index)}
                        </CardDescription>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {contributor.contributions} commits
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {contributor.bio && (
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {contributor.bio}
                      </p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      {contributor.location && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{contributor.location}</span>
                        </div>
                      )}
                      {contributor.company && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Building className="w-4 h-4" />
                          <span className="truncate">{contributor.company}</span>
                        </div>
                      )}
                      {contributor.blog && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Globe className="w-4 h-4" />
                          <a 
                            href={contributor.blog.startsWith('http') ? contributor.blog : `https://${contributor.blog}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {contributor.blog}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
                        {contributor.public_repos !== undefined && (
                          <span>{contributor.public_repos} repos</span>
                        )}
                        {contributor.followers !== undefined && (
                          <span>{contributor.followers} followers</span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(contributor.html_url, '_blank')}
                      >
                        <Github className="w-4 h-4 mr-1" />
                        Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No contributors found</p>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white border-0">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Join Our Contributors</h3>
                <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                  Want to contribute to Code Guardian? We welcome contributions from developers of all skill levels. 
                  Check out our repository and help us make code security accessible to everyone.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    className="bg-white text-green-600 hover:bg-green-50"
                    onClick={() => window.open('https://github.com/Xenonesis/code-guardian-report', '_blank')}
                  >
                    <Github className="w-5 h-5 mr-2" />
                    View Repository
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={() => window.open('https://github.com/Xenonesis/code-guardian-report/issues', '_blank')}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Report Issues
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GitHubContributorsSection;