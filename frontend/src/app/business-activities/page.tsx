'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Filter, Download, ExternalLink, Building, FileText, Globe, Shield } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Background } from '@/components/ui/background-dots-masked'
import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'
// Use API for real data

interface BusinessActivity {
  id: string;
  activity_code: string;
  activity_name: string;
  activity_description: string;
  activity_type: string;
  regulation_type?: string;
  freezone?: string;
  notes?: string;
  property_requirements?: string;
}

export default function BusinessActivitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [activities, setActivities] = useState<BusinessActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay for better UX

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load activities from API
  useEffect(() => {
    const loadActivities = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
        if (filterType !== 'all') params.append('activity_type', filterType);
        params.append('per_page', '1000'); // Get all activities
        
        const response = await fetch(`/api/business-activities?${params}`);
        const result = await response.json();
        
        if (result.data) {
          let sortedData = [...result.data];
          
          // Sort activities (only if no search query, as search results are already ranked)
          if (!debouncedSearchQuery) {
            sortedData.sort((a, b) => {
              switch (sortBy) {
                case 'code':
                  return a.activity_code.localeCompare(b.activity_code);
                case 'type':
                  return a.activity_type.localeCompare(b.activity_type);
                case 'name':
                default:
                  return a.activity_name.localeCompare(b.activity_name);
              }
            });
          }
          
          setActivities(sortedData);
          setTotalCount(result.meta?.total_count || sortedData.length);
        }
      } catch (error) {
        console.error('Failed to load business activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [debouncedSearchQuery, filterType, sortBy]);

  // For display purposes, use activities as filteredActivities
  const filteredActivities = activities;

  // Get unique activity types for filter
  const activityTypes = useMemo(() => {
    const types = activities.map((activity: BusinessActivity) => activity.activity_type);
    return Array.from(new Set(types)).filter(Boolean);
  }, [activities]);

  const exportToCSV = () => {
    const csvContent = [
      ['Activity Code', 'Activity Name', 'Description', 'Type'].join(','),
      ...filteredActivities.map((activity: BusinessActivity) => [
        activity.activity_code,
        `"${activity.activity_name}"`,
        `"${activity.activity_description || ''}"`,
        activity.activity_type
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'business-activities.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen gradient-background">
      <Background />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-border/20 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="hover:scale-105 transition-all duration-300">
                  <Logo />
                </Link>
                <div>
                  <h1 className="font-lora text-2xl font-bold gradient-text">Business Activities Directory</h1>
                  <p className="text-muted-foreground">Complete list of available business activities for UAE company formation</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Link href="/demo-form">
                  <Button className="gap-2 gradient-button">
                    <Building className="h-4 w-4" />
                    Start Application
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Filters and Search */}
          <Card className="p-6 mb-8 gradient-card border-0 shadow-lg">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by activity name, code, or description..."
                    className="pl-10 h-12 text-base rounded-2xl border-2"
                  />
                </div>
              </div>
              
              <div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="h-12 rounded-2xl border-2">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {activityTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-12 rounded-2xl border-2">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Activity Name</SelectItem>
                    <SelectItem value="code">Activity Code</SelectItem>
                    <SelectItem value="type">Activity Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
              <p className="text-muted-foreground">
                {isLoading ? 'Loading...' : `Showing ${filteredActivities.length} of ${totalCount} activities`}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Complete directory of IFZA business activities</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Activities Table */}
          <Card className="gradient-card border-0 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/20">
                  <tr>
                    <th className="text-left p-4 font-lora font-semibold">Activity Code</th>
                    <th className="text-left p-4 font-lora font-semibold">Activity Name</th>
                    <th className="text-left p-4 font-lora font-semibold">Description</th>
                    <th className="text-left p-4 font-lora font-semibold">Type</th>
                    <th className="text-left p-4 font-lora font-semibold">Regulation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.map((activity: BusinessActivity, index) => (
                    <tr key={activity.id} className="border-t border-border/20 hover:bg-muted/10 transition-colors">
                      <td className="p-4">
                        <Badge variant="outline" className="font-mono text-xs">
                          {activity.activity_code}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">{activity.activity_name}</span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                          {activity.activity_description}
                        </p>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant="secondary" 
                          className={`${
                            activity.activity_type === 'Professional' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {activity.activity_type}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Shield className={`h-4 w-4 ${
                            (activity as any).regulation_type === 'Regulated' 
                              ? 'text-orange-600' 
                              : 'text-green-600'
                          }`} />
                          <span className={`text-sm ${
                            (activity as any).regulation_type === 'Regulated' 
                              ? 'text-orange-600' 
                              : 'text-green-600'
                          }`}>
                            {(activity as any).regulation_type || 'Non-Regulated'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>


          {/* Call to Action */}
          <div className="mt-8 text-center">
            <Card className="p-8 gradient-card border-0 shadow-lg">
              <h2 className="font-lora text-2xl font-bold gradient-text mb-4">Ready to Start Your Business?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our streamlined process makes UAE company formation simple and transparent. 
                Get started today with our guided application form.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link href="/demo-form">
                  <Button size="lg" className="px-8 gradient-button">
                    Start Your Application
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="lg" className="px-8">
                    Learn More
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
