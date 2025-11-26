// src/hooks/useAndroid.ts
import { getStatisticsAndroidApp } from '@/apis/androidApis';
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
    enabled: !!payload.from && !!payload.to, // Only fetch when both dates are provided
  });

  // console.log('data', data?.statistic);

  const filteredData: any = useMemo(() => {
    if (!data) return [];

    return data?.data.filter((log: any) => {
      const matchesCountry =
        countryFilter === 'all' || log.countryOrRegion === countryFilter;
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
  };
};
