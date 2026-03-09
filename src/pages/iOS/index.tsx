import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatisticsTab, LogsTab } from '@/pages/Android/components';
import { useIos } from './useIos';

export function IosLog() {
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
    appListData,
  } = useIos();

  const getPurchaseBadgeVariant = (purchaseType: string) => {
    switch (purchaseType) {
      case 'mini':
        return 'outline';
      case 'weekly':
        return 'secondary';
      case 'monthly':
        return 'secondary';
      case 'yearly':
        return 'default';
      default:
        return 'outline';
    }
  };

  const handleExport = () => {
    console.log('Export clicked');
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="statistics" className="w-[100%]">
        <TabsList>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="logs">iOS Logs</TabsTrigger>
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
            paginatedData={Array.isArray((data as any)?.statistic) ? (data as any).statistic : []}
            subDetail={Array.isArray((data as any)?.subDetail) ? (data as any).subDetail : []}
            filteredData={Array.isArray((data as any)?.statistic) ? (data as any).statistic : []}
            totalPages={Math.ceil((Array.isArray((data as any)?.statistic) ? (data as any).statistic.length : 0) / 10)}
            totalEntries={Array.isArray((data as any)?.statistic) ? (data as any).statistic.length : 0}
            onExport={handleExport}
            onRefresh={handleRefresh}
            isLoading={isLoading}
            appListData={appListData}
          />
        </TabsContent>
        <TabsContent value="logs">
          <LogsTab
            isLoading={isLoading}
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
            appListData={appListData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

