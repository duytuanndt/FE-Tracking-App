// AndroidFilters.tsx
import { format } from 'date-fns';
import { CalendarIcon, Filter, X, Check, ChevronsUpDown } from 'lucide-react';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { purchaseTypeMock } from '@/mocks/purchaseTypeMock';
import { AndroidAppListResponse } from '@/entities/android';
import { countryMock } from '@/mocks/countryMock';

const datePresets = [
  { label: 'Today', days: 0 },
  { label: 'Yesterday', days: 1 },
  { label: 'Last 3 days', days: 3 },
  { label: 'This week', days: 6 },
  { label: 'Last 7 days', days: 7 },
  { label: 'This month', days: 29 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last month', days: 31 },
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
  appListData,
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
  appListData?: AndroidAppListResponse;
}) {
  const [appPopoverOpen, setAppPopoverOpen] = useState(false);
  const [countryPopoverOpen, setCountryPopoverOpen] = useState(false);
  const selectedApp = useMemo(() => {
    if (!appListData?.apps || appCodeFilter === 'all') return null;
    return appListData.apps.find((app) => app.appID === appCodeFilter);
  }, [appListData, appCodeFilter]);

  const countryOptions = useMemo(() => {
    return Object.entries(countryMock)
      .map(([code, name]) => ({
        code,
        name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const selectedCountry = useMemo(() => {
    if (countryFilter === 'all') return null;
    return countryOptions.find(
      (country) => country.code === countryFilter.toUpperCase(),
    );
  }, [countryFilter, countryOptions]);

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
    const now = new Date();
    let from: number;
    let to: number;

    switch (days) {
      case 0:
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        to = now.getTime();
        break;

      case 3:
        const threeDaysAgo = now.getTime() - 3 * 24 * 3600 * 1000;
        from = new Date(threeDaysAgo).setHours(0, 0, 0, 0);
        to = now.setHours(23, 59, 59, 999);
        break;

      case 6:
        let startingWeekday = 0;
        let startingWeekDate = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : startingWeekday);
        from = new Date(now.getFullYear(), now.getMonth(), startingWeekDate).getTime();
        to = from + 6 * 24 * 3600 * 1000;
        break;

      case 7:
        let sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
        from = new Date(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate()).getTime();
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        break;

      case 30:
        let thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
        from = new Date(thirtyDaysAgo.getFullYear(), thirtyDaysAgo.getMonth(), thirtyDaysAgo.getDate()).getTime();
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        break;

      case 29:
        from = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime();
        break;

      case 31:
        let startTime = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
        let endTime = new Date(now.getFullYear(), now.getMonth(), 0).getTime();
        from = new Date(startTime).getTime();
        to = new Date(endTime).getTime();
        break;

      default:
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).setHours(0, 0, 0, 0);
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).setHours(23, 59, 59, 999);
        break;
    }

    setStartDate(new Date(from));
    setEndDate(new Date(to));
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
        <CardContent className="pt-0 pb-3">
            {/* Dropdown Filters - compact row layout to match header filters */}
            <div className="flex flex-wrap items-center gap-2 md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Popover
                  open={appPopoverOpen}
                  onOpenChange={setAppPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={appPopoverOpen}
                      className="h-8 min-w-[200px] justify-between"
                    >
                      {selectedApp ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={selectedApp.appIcon}
                            alt={selectedApp.appName}
                            className="h-4 w-4 rounded"
                          />
                          <span>{selectedApp.appCode.toUpperCase()}</span>
                        </div>
                      ) : (
                        'Select app...'
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search app..." />
                      <CommandList>
                        <CommandEmpty>No app found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all"
                            onSelect={() => {
                              setAppCodeFilter('all');
                              setAppPopoverOpen(false);
                              handleFilterChange();
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                appCodeFilter === 'all'
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            All Apps
                          </CommandItem>
                          {appListData?.apps?.map((app) => (
                            <CommandItem
                              key={app._id}
                              value={`${app.appCode} ${app.appName}`}
                              onSelect={() => {
                                setAppCodeFilter(app.appID);
                                setAppPopoverOpen(false);
                                handleFilterChange();
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  appCodeFilter === app.appID
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              <div className="flex items-center gap-2">
                                <img
                                  src={app.appIcon}
                                  alt={app.appName}
                                  className="h-8 w-8 rounded"
                                />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    {app.appCode.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {app.appName}
                                  </span>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <Popover
                  open={!isStatistics && countryPopoverOpen}
                  onOpenChange={(openState) => {
                    if (isStatistics) return;
                    setCountryPopoverOpen(openState);
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={!isStatistics && countryPopoverOpen}
                      className="h-8 min-w-[200px] justify-between"
                      disabled={isStatistics}
                    >
                      {selectedCountry ? (
                        <span>
                          {selectedCountry.code} {selectedCountry.name}
                        </span>
                      ) : countryFilter === 'all' ? (
                        'All Countries'
                      ) : (
                        'Select country...'
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search country..." />
                      <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all"
                            onSelect={() => {
                              setCountryFilter('all');
                              setCountryPopoverOpen(false);
                              handleFilterChange();
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                countryFilter === 'all'
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            All Countries
                          </CommandItem>
                          {countryOptions.map((country) => (
                            <CommandItem
                              key={country.code}
                              value={`${country.code} ${country.name}`}
                              onSelect={() => {
                                setCountryFilter(country.code);
                                setCountryPopoverOpen(false);
                                handleFilterChange();
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  countryFilter.toUpperCase() === country.code
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {country.code}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {country.name}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <Select
                  value={purchaseTypeFilter}
                  onValueChange={(value) => {
                    setPurchaseTypeFilter(value);
                    handleFilterChange();
                  }}
                  disabled={isStatistics}
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
      {isStatistics ? null : ( null
        // <>
        //   <CardContent className="pt-0 pb-3">
        //     {/* Dropdown Filters - compact row layout to match header filters */}
        //     <div className="flex flex-wrap items-center gap-2 md:justify-between">
        //       <div className="flex flex-wrap items-center gap-2">
        //         <Select
        //           value={appCodeFilter}
        //           onValueChange={(value) => {
        //             setAppCodeFilter(value);
        //             handleFilterChange();
        //           }}
        //           disabled={true}
        //         >
        //           <SelectTrigger className="h-8 min-w-[160px]">
        //             <SelectValue placeholder="App code" />
        //           </SelectTrigger>
        //           <SelectContent>
        //             <SelectItem value="all">All App Codes</SelectItem>
        //             {uniqueAppCodes.map((code) => (
        //               <SelectItem key={code} value={code}>
        //                 {code}
        //               </SelectItem>
        //             ))}
        //           </SelectContent>
        //         </Select>

        //         <Select
        //           value={countryFilter}
        //           onValueChange={(value) => {
        //             setCountryFilter(value);
        //             handleFilterChange();
        //           }}
        //           disabled={true}
        //         >
        //           <SelectTrigger className="h-8 min-w-[160px]">
        //             <SelectValue placeholder="Country/Region"  />
        //           </SelectTrigger>
        //           <SelectContent>
        //             <SelectItem value="all">All Countries</SelectItem>
        //             {uniqueCountries.map((country) => (
        //               <SelectItem key={country} value={country}>
        //                 {country}
        //               </SelectItem>
        //             ))}
        //           </SelectContent>
        //         </Select>

        //         <Select
        //           value={purchaseTypeFilter}
        //           onValueChange={(value) => {
        //             setPurchaseTypeFilter(value);
        //             handleFilterChange();
        //           }}
        //           disabled={true}
        //         >
        //           <SelectTrigger className="h-8 min-w-[160px]">
        //             <SelectValue placeholder="Purchase type" />
        //           </SelectTrigger>
        //           <SelectContent>
        //             <SelectItem value="all">All Purchase Types</SelectItem>
        //             {uniquePurchaseTypes.map((type) => (
        //               <SelectItem key={type} value={type}>
        //                 {type}
        //               </SelectItem>
        //             ))}
        //           </SelectContent>
        //         </Select>
        //       </div>

        //       <Button
        //         variant="outline"
        //         size="sm"
        //         onClick={clearFilters}
        //         className="h-8"
        //       >
        //         <X className="mr-2 h-4 w-4" />
        //         Clear all filters
        //       </Button>
        //     </div>
        //   </CardContent>
        // </>
      )}
    </Card>
  );
}
