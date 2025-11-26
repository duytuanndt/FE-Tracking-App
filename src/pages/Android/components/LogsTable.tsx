import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Log {
  _id: string;
  appCode: string;
  appName: string;
  appID: string;
  appIcon: string;
  purchase: string;
  countryOrRegion: string;
  createdAt: string;
}

interface LogsTableProps {
  isLoading: boolean;
  data: Log[];
  getPurchaseBadgeVariant: (purchaseType: string) => 'default' | 'secondary' | 'outline';
}

export function LogsTable({isLoading, data, getPurchaseBadgeVariant }: LogsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="">App Icon</TableHead>
            <TableHead className="text-center">App Code</TableHead>
            <TableHead className="text-center">App Name</TableHead>
            <TableHead className="text-center">Purchase</TableHead>
            <TableHead className="text-center">Country/Region</TableHead>
            <TableHead className="text-center">Date Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            isLoading ? (
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
              data.map((log) => (
                <TableRow key={log._id}>
                  <TableCell className="font-medium">
                    <img
                      src={log.appIcon}
                      alt=""
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease-in-out',
                        alignItems: 'center',
                        alignContent: 'center',
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-center">
                    {log.appCode.toString().toUpperCase()}
                  </TableCell>
                  <TableCell className="text-center">{log.appName}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getPurchaseBadgeVariant(log.purchase)}>
                      {log.purchase}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {log.countryOrRegion}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-center">
                    {format(new Date(log.createdAt), 'dd-MM-yyyy HH:mm:ss')}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No results found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            )
          }
        </TableBody>
      </Table>
    </div>
  );
}

