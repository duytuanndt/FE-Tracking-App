import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Summary } from '@/entities/android';
import { purchaseTypeMock } from '@/mocks/purchaseTypeMock';
import { useMemo } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface PurchaseTypeChartProps {
  data: Summary[];
  isLoading?: boolean;
}

export function PurchaseTypeChart({ data, isLoading }: PurchaseTypeChartProps) {
  // Transform and sort data by total purchases (descending)
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return [...data]
      .sort((a, b) => (b.total || 0) - (a.total || 0))
      .map((item) => ({
        countryOrRegion: item.countryOrRegion,
        total: item.total || 0,
        mini: item.mini || 0,
        weekly: item.weekly || 0,
        monthly: item.monthly || 0,
        yearly: item.yearly || 0,
        'mini coin pack': item['mini-coin-pack'] || 0,
        'large coin pack': item['large-coin-pack'] || 0,
        'one time': item['one-time'] || 0,
      }));
  }, [data]);

  // Chart configuration for purchase types - each type has its own distinct color
  const chartConfig = useMemo(() => {
    // Color mapping for each purchase type
    const colorMap: Record<string, string> = {
      'mini': '#3b82f6', // Blue
      'one time': '#10b981', // Green
      'weekly': '#f59e0b', // Amber
      'monthly': '#8b5cf6', // Purple
      'yearly': '#ef4444', // Red
      'mini coin pack': '#06b6d4', // Cyan
      'large coin pack': '#f97316', // Orange
    };

    const config: Record<string, { label: string; color: string }> = {};
    purchaseTypeMock.forEach((type) => {
      config[type] = {
        label: type.charAt(0).toUpperCase() + type.slice(1),
        color: colorMap[type] || 'hsl(var(--chart-1))',
      };
      console.log(config)
    });

    return config;
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Purchase Type by Country</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            {/* <p className="text-muted-foreground">Loading chart data...</p> */}
            <Skeleton className="w-full h-[400px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Purchase Type by Country</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Type by Country</CardTitle>
        <p className="text-sm text-muted-foreground">
          Stacked bar chart showing purchase types (mini, yearly, weekly, monthly, mini coin pack, large coin pack, one time) breakdown by country, sorted by total purchases
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="countryOrRegion"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    value,
                    chartConfig[name as string]?.label || name,
                  ]}
                />
              }
            />
            <ChartLegend
              content={<ChartLegendContent />}
              wrapperStyle={{ paddingTop: '20px' }}
            />
            {purchaseTypeMock.map((type) => (
              <Bar
                key={type}
                dataKey={type}
                stackId="purchases"
                fill={chartConfig[type]?.color || 'hsl(var(--chart-1))'}
                name={chartConfig[type]?.label || type}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

