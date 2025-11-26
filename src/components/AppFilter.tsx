// AndroidFilters.tsx
import { format } from 'date-fns';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { mockAndroidLogs } from '@/mocks/androidMock';

const datePresets = [
  { label: 'Today', days: 0 },
  { label: 'Yesterday', days: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

export default function AppFilters({
  isStatistics,
  appCodeFilter,
  setAppCodeFilter,
  countryFilter,
  setCountryFilter,
  purchaseTypeFilter,
  setPurchaseTypeFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  handleFilterChange,
  clearFilters,
  hasActiveFilters,
}: {
  isStatistics: boolean;
  appCodeFilter: string;
  setAppCodeFilter: (value: string) => void;
  countryFilter: string;
  setCountryFilter: (value: string) => void;
  purchaseTypeFilter: string;
  setPurchaseTypeFilter: (value: string) => void;
  startDate?: Date;
  setStartDate: (value: Date | undefined) => void;
  endDate?: Date;
  setEndDate: (value: Date | undefined) => void;
  handleFilterChange: () => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}) {
  // console.log('isStatistics', isStatistics);
  const uniqueAppCodes = useMemo(() => {
    return Array.from(
      new Set(mockAndroidLogs.map((log) => log.appCode)),
    ).sort();
  }, []);

  const uniqueCountries = useMemo(() => {
    return Array.from(
      new Set(mockAndroidLogs.map((log) => log.countryOrRegion)),
    ).sort();
  }, []);

  const uniquePurchaseTypes = useMemo(() => {
    return Array.from(
      new Set(mockAndroidLogs.map((log) => log.purchase)),
    ).sort();
  }, []);

  const clearDateRange = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    handleFilterChange();
  };

  const setDatePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    if (days === 0) {
      setStartDate(start);
      setEndDate(end);
    } else if (days === 1) {
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      setStartDate(start);
      setEndDate(end);
    } else {
      start.setDate(start.getDate() - days);
      setStartDate(start);
      setEndDate(end);
    }
    handleFilterChange();
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                Active
              </Badge>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Date Range</span>
            {(startDate || endDate) && (
              <Button variant="ghost" size="sm" onClick={clearDateRange}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {datePresets.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => setDatePreset(preset.days)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      handleFilterChange();
                    }}
                    // Fix type error: Always return a boolean
                    disabled={(date) =>
                      date > new Date() || (!!endDate && date > endDate)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Pick end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      handleFilterChange();
                    }}
                    disabled={(date) =>
                      date > new Date() || (!!startDate && date < startDate)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Dropdown Filters */}
        {isStatistics ? null : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">App Code</label>
              <Select
                value={appCodeFilter}
                onValueChange={(value) => {
                  setAppCodeFilter(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select app code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All App Codes</SelectItem>
                  {uniqueAppCodes.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Country/Region</label>
              <Select
                value={countryFilter}
                onValueChange={(value) => {
                  setCountryFilter(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {uniqueCountries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Purchase Type</label>
              <Select
                value={purchaseTypeFilter}
                onValueChange={(value) => {
                  setPurchaseTypeFilter(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select purchase type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Purchase Types</SelectItem>
                  {uniquePurchaseTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full bg-transparent"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
