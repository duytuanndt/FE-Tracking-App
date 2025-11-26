import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StatisticsTableProps {
  isLoading: boolean;
  data: Array<{
    appCode: string;
    appName: string;
    appIcon: string;
    count: number;
  }>;
}

export function StatisticsTable({ data, isLoading}: StatisticsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
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
            // <TableRow>
            //   <TableCell colSpan={4} className="h-24 text-center">
            //     Loading...
            //   </TableCell>
            // </TableRow>
          ) : data.length > 0? (
            data.map((log) => (
              <TableRow key={log.appCode}>
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
                  {log.appCode.toString().toUpperCase()}
                </TableCell>
                <TableCell className="text-center">{log.appName}</TableCell>
                <TableCell className="font-mono text-sm text-center">
                  {log.count}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No results found. Try adjusting your filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

