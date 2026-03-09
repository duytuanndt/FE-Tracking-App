// src/hooks/useAndroid.ts
import { getStatisticsAndroidApp, getAndroidAppList } from '@/apis/androidApis';
import { AndroidAppListParams } from '@/entities/android';
import { countryMock } from '@/mocks/countryMock';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';

export const useAndroid = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [appCodeFilter, setAppCodeFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [purchaseTypeFilter, setPurchaseTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const payload = useMemo(() => {
    return {
      from: new Date(
        startDate ||
          new Date(new Date().setDate(new Date().getDate() - 1)).setHours(
            0,
            0,
            0,
            0,
          ),
      ).getTime(),
      to: new Date(endDate || Date.now()).getTime(),
      appID: appCodeFilter !== 'all' ? appCodeFilter : '',
    };
  }, [startDate, endDate, appCodeFilter]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['statistics', payload],
    queryFn: () => getStatisticsAndroidApp(payload),
    enabled: !!payload.from && !!payload.to,
  });
  console.log(data?.summary);

  const appListParams = useMemo<AndroidAppListParams>(() => {
    return {
      isLive: true,
      distributor: '',
      appName: '',
      appCode: '',
      // storeId: '',
    };
  }, []);

  const {
    data: appListData,
    isLoading: isAppListLoading,
    error: appListError,
    refetch: refetchAppList,
  } = useQuery({
    queryKey: ['android-apps', appListParams],
    queryFn: () => getAndroidAppList(appListParams),
  });

  const filteredData: any = useMemo(() => {
    if (!data || !Array.isArray((data as any)?.data)) return [];

    return ((data as any)?.data ?? []).filter((log: any) => {
      const resolvedCountryName =
        countryFilter === 'all'
          ? null
          : ((countryMock as Record<string, string>)[
              countryFilter.toUpperCase()
            ] ?? countryFilter);

      const matchesCountry =
        countryFilter === 'all' || log.countryOrRegion === resolvedCountryName;
      const matchesPurchase =
        purchaseTypeFilter === 'all' || log.purchase === purchaseTypeFilter;
      return matchesCountry && matchesPurchase;
    });
  }, [data, countryFilter, purchaseTypeFilter]);

  const ITEMS_PER_PAGE = 10;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const handleFilterChange = () => setCurrentPage(1);

  const clearFilters = () => {
    setAppCodeFilter('all');
    setCountryFilter('all');
    setPurchaseTypeFilter('all');
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
  };

  const hasActiveFilters: boolean =
    appCodeFilter !== 'all' ||
    countryFilter !== 'all' ||
    purchaseTypeFilter !== 'all' ||
    !!startDate ||
    !!endDate;

  return {
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
    isLoading,
    error,
    refetch,
    data,
    appListData,
    isAppListLoading,
    appListError,
    refetchAppList,
    appListQueryKey: ['android-apps', appListParams],
  };
};
