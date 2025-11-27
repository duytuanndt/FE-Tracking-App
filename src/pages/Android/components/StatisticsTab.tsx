import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionButtons } from './ActionButtons';
import { StatisticsTable } from './StatisticsTable';
import { TablePagination } from './TablePagination';
import AppFilters from '@/components/AppFilter';
import { AndroidAppListResponse } from '@/entities/android';

interface StatisticsTabProps {
  appCodeFilter: string;
  setAppCodeFilter: (value: string) => void;
  countryFilter: string;
  setCountryFilter: (value: string) => void;
  purchaseTypeFilter: string;
  setPurchaseTypeFilter: (value: string) => void;
  startDate: Date | undefined;
  setStartDate: (value: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (value: Date | undefined) => void;
  handleFilterChange: () => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  paginatedData: any[];
  subDetail: any[];
  filteredData: any[];
  totalPages: number;
  totalEntries: number;
  onExport?: () => void;
  onRefresh?: () => void;
  isLoading: boolean;
  appListData?: AndroidAppListResponse;
}

export function StatisticsTab({
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
  currentPage,
  setCurrentPage,
  paginatedData,
  filteredData,
  totalPages,
  totalEntries,
  onExport,
  onRefresh,
  isLoading,
  subDetail,
  appListData,
}: StatisticsTabProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-muted-foreground ml-1">
            Statistics on the number of purchased packages of all apps
          </p>
        </div>
        <ActionButtons onExport={onExport} onRefresh={onRefresh} />
      </div>

      <AppFilters
        isStatistics={true}
        appCodeFilter={appCodeFilter}
        setAppCodeFilter={setAppCodeFilter}
        countryFilter={countryFilter}
        setCountryFilter={setCountryFilter}
        purchaseTypeFilter={purchaseTypeFilter}
        setPurchaseTypeFilter={setPurchaseTypeFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        handleFilterChange={handleFilterChange}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        appListData={appListData}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Statistics Entries</CardTitle>
            <div className="text-sm text-muted-foreground">
              Showing {paginatedData.length} of {filteredData.length} entries
              {hasActiveFilters && (
                <span className="ml-2 text-blue-600">
                  (filtered from {totalEntries} total)
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <StatisticsTable data={paginatedData} isLoading={isLoading} subDetail={subDetail}/>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </>
  );
}

