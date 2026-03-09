import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface PurchaseTypeDetail {
  appID: string;
  appIcon: string;
  appName: string;
  purchase: string;
  count: number;
}

interface StatisticsItem {
  appCode: string;
  appName: string;
  appIcon: string;
  appID: string;
  count: number;
}

interface StatisticsTableProps {
  isLoading: boolean;
  data: StatisticsItem[];
  subDetail: PurchaseTypeDetail[];
}

export function StatisticsTable({ data, isLoading, subDetail }: StatisticsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (appCode: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(appCode)) {
      newExpanded.delete(appCode);
    } else {
      newExpanded.add(appCode);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="text-center">App Icon</TableHead>
            <TableHead className="text-center">App Code</TableHead>
            <TableHead className="text-center">App Name</TableHead>
            <TableHead className="text-center">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Pre loading when call request api */}
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="w-[50px]">
                  <div className="h-4 w-4 rounded animate-pulse bg-muted" />
                </TableCell>
                <TableCell className="justify-items-center">
                  <div className="h-[50px] w-[50px] rounded-lg animate-pulse bg-muted" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="h-4 w-16 mx-auto rounded animate-pulse bg-muted" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="h-4 w-32 mx-auto rounded animate-pulse bg-muted" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="h-4 w-10 mx-auto rounded animate-pulse bg-muted" />
                </TableCell>
              </TableRow>
            ))
          ) : data.length > 0 ? (
            data.map((log: StatisticsItem) => {
              // Find all sub-detail rows that belong to this app (by appID)
              const appSubDetails = subDetail.filter(
                (detail) => detail.appID === log.appID,
              );
              const hasSubDetail = appSubDetails.length > 0;
              const isExpanded = expandedRows.has(log.appCode);

              return (
                <>
                  <TableRow
                    key={log.appCode}
                    className={cn(
                      'cursor-pointer hover:bg-muted/50 transition-colors',
                      hasSubDetail && 'hover:bg-muted/70',
                    )}
                    onClick={() => hasSubDetail && toggleRow(log.appCode)}
                  >
                    <TableCell className="w-[50px]">
                      {hasSubDetail ? (
                        isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )
                      ) : (
                        <div className="w-4" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium justify-items-center">
                      <img
                        src={log.appIcon}
                        alt=""
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease-in-out',
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-center">
                      {log?.appCode?.toString().toUpperCase()}
                    </TableCell>
                    <TableCell className="text-center">{log.appName}</TableCell>
                    <TableCell className="font-mono text-sm text-center">
                      {log.count}
                    </TableCell>
                  </TableRow>
                  {isExpanded && hasSubDetail && (
                    <TableRow key={`${log.appCode}-detail`}>
                      <TableCell colSpan={5} className="bg-muted/30 p-4">
                        <div className="pl-8 space-y-2">
                          <div className="text-sm font-semibold mb-3 text-muted-foreground">
                            Purchase Type Breakdown:
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {appSubDetails.map((detail) => (
                              <div
                                key={`${detail.appID}-${detail.purchase}`}
                                className="flex flex-col items-start p-3 bg-background rounded-lg border"
                              >
                                <span className="text-xs text-muted-foreground mb-1 font-bold">
                                  {detail.purchase.toUpperCase()}
                                </span>
                                <span className="text-lg font-semibold">
                                  {detail.count}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No results found. Try adjusting your filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

