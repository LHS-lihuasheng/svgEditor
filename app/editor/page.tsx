import { PanelProvider } from '@/contexts/PanelContext';
import { SVGEditor } from '@/components/SVGEditor/SVGEditor';

export default function EditorPage() {
  return (
    <PanelProvider>
      <SVGEditor />
    </PanelProvider>
  );
} 