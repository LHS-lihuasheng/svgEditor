import { PanelProvider } from '@/contexts/PanelContext';
import { SVGEditor } from '@/components/SVGEditor';

export default function EditorPage() {
  return (
    <PanelProvider>
      <SVGEditor />
    </PanelProvider>
  );
} 