import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAndroid } from './useAndroid';
import { StatisticsTab } from './components/StatisticsTab';
import { LogsTab } from './components/LogsTab';

export function AndroidLog() {
  const {
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
    currentPage,
    setCurrentPage,
    paginatedData,
    filteredData,
    totalPages,
    handleFilterChange,
    clearFilters,
    hasActiveFilters,
    data,
    refetch,
    isLoading,
  } = useAndroid();

  const getPurchaseBadgeVariant = (purchaseType: string) => {
    switch (purchaseType) {
      case 'Premium Subscription':
        return 'default';
      case 'In-App Purchase':
        return 'secondary';
      case 'Free Download':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export clicked');
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="statistics" className="w-[100%]]">
        <TabsList>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="logs">Android Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="statistics">
          <StatisticsTab
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
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            paginatedData={data?.statistic || []}
            subDetail={data?.subDetail || []}
            filteredData={data?.statistic || []}
            totalPages={Math.ceil((data?.statistic?.length || 0) / 10)}
            totalEntries={data?.statistic?.length || 0}
            onExport={handleExport}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="logs">
          <LogsTab
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
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            paginatedData={paginatedData}
            filteredData={filteredData}
            totalPages={totalPages}
            onExport={handleExport}
            onRefresh={handleRefresh}
            getPurchaseBadgeVariant={getPurchaseBadgeVariant}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
