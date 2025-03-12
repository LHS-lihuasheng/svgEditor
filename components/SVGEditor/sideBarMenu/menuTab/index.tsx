import { ScrollArea } from "@/components/ui/scroll-area"
import { usePanel } from "@/contexts/PanelContext"
import { ComponentsTab } from "./items/ComponentsTab"
import { AssetsTab } from "./items/AssetsTab"

export function MenuTab() {
    const { activeTab: currentActiveTab } = usePanel()
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
                {currentActiveTab === 'components' ? (
                    <ComponentsTab />
                ) : (
                    <AssetsTab />
                )}
            </ScrollArea>
        </div>
    )
}