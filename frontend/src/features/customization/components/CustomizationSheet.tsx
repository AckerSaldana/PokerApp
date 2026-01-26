import { Sheet } from '@/components/ui/Sheet';
import { CustomizationCollection } from './CustomizationCollection';
import { Sparkles } from 'lucide-react';

interface CustomizationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomizationSheet({ isOpen, onClose }: CustomizationSheetProps) {
  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#d4af37]" />
          <div>
            <h2 className="text-2xl font-bold text-white">Customization</h2>
            <p className="text-sm text-zinc-400">Unlock frames and titles by earning achievements</p>
          </div>
        </div>

        {/* Collection */}
        <CustomizationCollection />
      </div>
    </Sheet>
  );
}
