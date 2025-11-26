import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  onExport?: () => void;
  onRefresh?: () => void;
}

export function ActionButtons({ onExport, onRefresh }: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onExport}>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
      <Button variant="outline" size="sm" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>
  );
}

