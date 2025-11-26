// AndroidFilters.tsx
import { format } from 'date-fns';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { appsMock } from '@/mocks/appMock';
import { purchaseTypeMock } from '@/mocks/purchaseTypeMock';

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
  const uniqueAppCodes = useMemo(() => {
    return Array.from(
      new Set(appsMock.map((log) => log.toLocaleUpperCase())),
    ).sort();
  }, []);

  const uniqueCountries = useMemo(() => {
    return Array.from(
      new Set(mockAndroidLogs.map((log) => log.countryOrRegion)),
    ).sort();
  }, []);

  const uniquePurchaseTypes = useMemo(() => {
    return Array.from(
      new Set(purchaseTypeMock.map((log) => log.replace(/^\w/, (c) => c.toUpperCase()))));
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
      <CardContent className="py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Filters
              </span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  Active
                </Badge>
              )}
            </div>

            <div className="flex flex-1 flex-wrap items-center gap-2 md:justify-end">
              <div className="flex flex-wrap items-center gap-1">
                {datePresets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    onClick={() => setDatePreset(preset.days)}
                    className="h-8 px-2 text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        'h-8 min-w-[150px] justify-start text-left font-normal',
                        !startDate && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : 'Start date'}
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
                      disabled={(date) =>
                        date > new Date() || (!!endDate && date > endDate)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <span className="text-xs text-muted-foreground">to</span>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        'h-8 min-w-[150px] justify-start text-left font-normal',
                        !endDate && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : 'End date'}
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

                {(startDate || endDate) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={clearDateRange}
                    aria-label="Clear date range"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      {isStatistics ? null : (
        <>
          <CardContent className="pt-0 pb-3">
            {/* Dropdown Filters - compact row layout to match header filters */}
            <div className="flex flex-wrap items-center gap-2 md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={appCodeFilter}
                  onValueChange={(value) => {
                    setAppCodeFilter(value);
                    handleFilterChange();
                  }}
                  disabled={true}
                >
                  <SelectTrigger className="h-8 min-w-[160px]">
                    <SelectValue placeholder="App code" />
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

                <Select
                  value={countryFilter}
                  onValueChange={(value) => {
                    setCountryFilter(value);
                    handleFilterChange();
                  }}
                  disabled={true}
                >
                  <SelectTrigger className="h-8 min-w-[160px]">
                    <SelectValue placeholder="Country/Region"  />
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

                <Select
                  value={purchaseTypeFilter}
                  onValueChange={(value) => {
                    setPurchaseTypeFilter(value);
                    handleFilterChange();
                  }}
                  disabled={true}
                >
                  <SelectTrigger className="h-8 min-w-[160px]">
                    <SelectValue placeholder="Purchase type" />
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

              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-8"
              >
                <X className="mr-2 h-4 w-4" />
                Clear all filters
              </Button>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}
