"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { CalendarIcon, Filter, Download, RefreshCw, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Enhanced mock data with varied dates for better demonstration
const mockAndroidLogs = [
  {
    id: 1,
    appCode: "APP001",
    appName: "Social Media Pro",
    appId: "com.example.socialmedia",
    purchase: "Premium Subscription",
    countryOrRegion: "United States",
    time: "2024-01-15 14:30:25",
    timestamp: new Date("2024-01-15T14:30:25"),
  },
  {
    id: 2,
    appCode: "APP002",
    appName: "Photo Editor Plus",
    appId: "com.example.photoeditor",
    purchase: "In-App Purchase",
    countryOrRegion: "Canada",
    time: "2024-01-14 13:45:12",
    timestamp: new Date("2024-01-14T13:45:12"),
  },
  {
    id: 3,
    appCode: "APP003",
    appName: "Fitness Tracker",
    appId: "com.example.fitness",
    purchase: "Free Download",
    countryOrRegion: "United Kingdom",
    time: "2024-01-13 12:20:08",
    timestamp: new Date("2024-01-13T12:20:08"),
  },
  {
    id: 4,
    appCode: "APP001",
    appName: "Social Media Pro",
    appId: "com.example.socialmedia",
    purchase: "In-App Purchase",
    countryOrRegion: "Germany",
    time: "2024-01-12 11:15:33",
    timestamp: new Date("2024-01-12T11:15:33"),
  },
  {
    id: 5,
    appCode: "APP004",
    appName: "Music Player",
    appId: "com.example.musicplayer",
    purchase: "Premium Subscription",
    countryOrRegion: "France",
    time: "2024-01-11 10:30:45",
    timestamp: new Date("2024-01-11T10:30:45"),
  },
  {
    id: 6,
    appCode: "APP005",
    appName: "Weather App",
    appId: "com.example.weather",
    purchase: "Free Download",
    countryOrRegion: "Japan",
    time: "2024-01-10 09:45:22",
    timestamp: new Date("2024-01-10T09:45:22"),
  },
  {
    id: 7,
    appCode: "APP002",
    appName: "Photo Editor Plus",
    appId: "com.example.photoeditor",
    purchase: "Premium Subscription",
    countryOrRegion: "Australia",
    time: "2024-01-09 08:20:15",
    timestamp: new Date("2024-01-09T08:20:15"),
  },
  {
    id: 8,
    appCode: "APP006",
    appName: "Task Manager",
    appId: "com.example.taskmanager",
    purchase: "In-App Purchase",
    countryOrRegion: "Brazil",
    time: "2024-01-08 07:35:40",
    timestamp: new Date("2024-01-08T07:35:40"),
  },
  {
    id: 9,
    appCode: "APP003",
    appName: "Fitness Tracker",
    appId: "com.example.fitness",
    purchase: "Premium Subscription",
    countryOrRegion: "India",
    time: "2024-01-07 06:50:18",
    timestamp: new Date("2024-01-07T06:50:18"),
  },
  {
    id: 10,
    appCode: "APP007",
    appName: "News Reader",
    appId: "com.example.newsreader",
    purchase: "Free Download",
    countryOrRegion: "South Korea",
    time: "2024-01-06 05:25:55",
    timestamp: new Date("2024-01-06T05:25:55"),
  },
  {
    id: 11,
    appCode: "APP001",
    appName: "Social Media Pro",
    appId: "com.example.socialmedia",
    purchase: "Free Download",
    countryOrRegion: "Mexico",
    time: "2024-01-05 04:40:30",
    timestamp: new Date("2024-01-05T04:40:30"),
  },
  {
    id: 12,
    appCode: "APP008",
    appName: "Calculator Pro",
    appId: "com.example.calculator",
    purchase: "In-App Purchase",
    countryOrRegion: "Spain",
    time: "2024-01-04 03:15:42",
    timestamp: new Date("2024-01-04T03:15:42"),
  },
  {
    id: 13,
    appCode: "APP009",
    appName: "Video Player",
    appId: "com.example.videoplayer",
    purchase: "Premium Subscription",
    countryOrRegion: "Italy",
    time: "2024-01-03 02:30:15",
    timestamp: new Date("2024-01-03T02:30:15"),
  },
  {
    id: 14,
    appCode: "APP010",
    appName: "Language Learning",
    appId: "com.example.language",
    purchase: "Free Download",
    countryOrRegion: "Netherlands",
    time: "2024-01-02 01:45:30",
    timestamp: new Date("2024-01-02T01:45:30"),
  },
  {
    id: 15,
    appCode: "APP004",
    appName: "Music Player",
    appId: "com.example.musicplayer",
    purchase: "In-App Purchase",
    countryOrRegion: "Sweden",
    time: "2024-01-01 23:20:45",
    timestamp: new Date("2024-01-01T23:20:45"),
  },
  {
    id: 16,
    appCode: "APP002",
    appName: "Photo Editor Plus",
    appId: "com.example.photoeditor",
    purchase: "Free Download",
    countryOrRegion: "Norway",
    time: "2023-12-31 22:15:30",
    timestamp: new Date("2023-12-31T22:15:30"),
  },
  {
    id: 17,
    appCode: "APP005",
    appName: "Weather App",
    appId: "com.example.weather",
    purchase: "Premium Subscription",
    countryOrRegion: "Denmark",
    time: "2023-12-30 21:30:15",
    timestamp: new Date("2023-12-30T21:30:15"),
  },
  {
    id: 18,
    appCode: "APP001",
    appName: "Social Media Pro",
    appId: "com.example.socialmedia",
    purchase: "In-App Purchase",
    countryOrRegion: "Finland",
    time: "2023-12-29 20:45:00",
    timestamp: new Date("2023-12-29T20:45:00"),
  },
]

const ITEMS_PER_PAGE = 10

// Quick date range presets
const datePresets = [
  { label: "Today", days: 0 },
  { label: "Yesterday", days: 1 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
]

export function AndroidLog() {
  const [currentPage, setCurrentPage] = useState(1)
  const [appCodeFilter, setAppCodeFilter] = useState("all")
  const [countryFilter, setCountryFilter] = useState("all")
  const [purchaseTypeFilter, setPurchaseTypeFilter] = useState("all")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  // Get unique values for filter options
  const uniqueAppCodes = useMemo(() => {
    return Array.from(new Set(mockAndroidLogs.map((log) => log.appCode))).sort()
  }, [])

  const uniqueCountries = useMemo(() => {
    return Array.from(new Set(mockAndroidLogs.map((log) => log.countryOrRegion))).sort()
  }, [])

  const uniquePurchaseTypes = useMemo(() => {
    return Array.from(new Set(mockAndroidLogs.map((log) => log.purchase))).sort()
  }, [])

  // Filter data based on selected filters including date range
  const filteredData = useMemo(() => {
    return mockAndroidLogs.filter((log) => {
      const matchesAppCode = appCodeFilter === "all" || log.appCode === appCodeFilter
      const matchesCountry = countryFilter === "all" || log.countryOrRegion === countryFilter
      const matchesPurchaseType = purchaseTypeFilter === "all" || log.purchase === purchaseTypeFilter

      // Date range filtering
      let matchesDateRange = true
      if (startDate || endDate) {
        const logDate = log.timestamp
        if (startDate && endDate) {
          // Both dates selected - check if log date is within range
          const start = new Date(startDate)
          start.setHours(0, 0, 0, 0)
          const end = new Date(endDate)
          end.setHours(23, 59, 59, 999)
          matchesDateRange = logDate >= start && logDate <= end
        } else if (startDate) {
          // Only start date selected - from start date onwards
          const start = new Date(startDate)
          start.setHours(0, 0, 0, 0)
          matchesDateRange = logDate >= start
        } else if (endDate) {
          // Only end date selected - up to end date
          const end = new Date(endDate)
          end.setHours(23, 59, 59, 999)
          matchesDateRange = logDate <= end
        }
      }

      return matchesAppCode && matchesCountry && matchesPurchaseType && matchesDateRange
    })
  }, [appCodeFilter, countryFilter, purchaseTypeFilter, startDate, endDate])

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage])

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)

  // Reset to first page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setAppCodeFilter("all")
    setCountryFilter("all")
    setPurchaseTypeFilter("all")
    setStartDate(undefined)
    setEndDate(undefined)
    setCurrentPage(1)
  }

  const clearDateRange = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    handleFilterChange()
  }

  const setDatePreset = (days: number) => {
    const end = new Date()
    const start = new Date()
    if (days === 0) {
      // Today
      setStartDate(start)
      setEndDate(end)
    } else if (days === 1) {
      // Yesterday
      start.setDate(start.getDate() - 1)
      end.setDate(end.getDate() - 1)
      setStartDate(start)
      setEndDate(end)
    } else {
      // Last N days
      start.setDate(start.getDate() - days)
      setStartDate(start)
      setEndDate(end)
    }
    handleFilterChange()
  }

  const getPurchaseBadgeVariant = (purchaseType: string) => {
    switch (purchaseType) {
      case "Premium Subscription":
        return "default"
      case "In-App Purchase":
        return "secondary"
      case "Free Download":
        return "outline"
      default:
        return "outline"
    }
  }

  const hasActiveFilters =
    appCodeFilter !== "all" || countryFilter !== "all" || purchaseTypeFilter !== "all" || startDate || endDate

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Android Logs</h1>
          <p className="text-muted-foreground">Monitor and analyze Android application activities and purchases</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
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
          {/* Date Range Filter Section */}
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

            {/* Quick Date Presets */}
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

            {/* Custom Date Range Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date)
                        handleFilterChange()
                      }}
                      disabled={(date) => date > new Date() || (endDate && date > endDate)}
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
                      className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date)
                        handleFilterChange()
                      }}
                      disabled={(date) => date > new Date() || (startDate && date < startDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Date Range Display */}
            {(startDate || endDate) && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">Selected Range: </span>
                  {startDate && endDate ? (
                    <>
                      {format(startDate, "MMM dd, yyyy")} - {format(endDate, "MMM dd, yyyy")}
                      <span className="text-muted-foreground ml-2">
                        ({Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days)
                      </span>
                    </>
                  ) : startDate ? (
                    <>From {format(startDate, "MMM dd, yyyy")} onwards</>
                  ) : endDate ? (
                    <>Up to {format(endDate, "MMM dd, yyyy")}</>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Other Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">App Code</label>
              <Select
                value={appCodeFilter}
                onValueChange={(value) => {
                  setAppCodeFilter(value)
                  handleFilterChange()
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
                  setCountryFilter(value)
                  handleFilterChange()
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
                  setPurchaseTypeFilter(value)
                  handleFilterChange()
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
              <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                Clear All Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Android Log Entries</CardTitle>
            <div className="text-sm text-muted-foreground">
              Showing {paginatedData.length} of {filteredData.length} entries
              {hasActiveFilters && (
                <span className="ml-2 text-blue-600">(filtered from {mockAndroidLogs.length} total)</span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App Code</TableHead>
                  <TableHead>App Name</TableHead>
                  <TableHead>App ID</TableHead>
                  <TableHead>Purchase</TableHead>
                  <TableHead>Country/Region</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.appCode}</TableCell>
                      <TableCell>{log.appName}</TableCell>
                      <TableCell className="font-mono text-sm">{log.appId}</TableCell>
                      <TableCell>
                        <Badge variant={getPurchaseBadgeVariant(log.purchase)}>{log.purchase}</Badge>
                      </TableCell>
                      <TableCell>{log.countryOrRegion}</TableCell>
                      <TableCell className="font-mono text-sm">{log.time}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No results found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setCurrentPage(currentPage - 1)
                      }}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber
                    if (totalPages <= 5) {
                      pageNumber = i + 1
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i
                    } else {
                      pageNumber = currentPage - 2 + i
                    }

                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(pageNumber)
                          }}
                          isActive={currentPage === pageNumber}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                      }}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
