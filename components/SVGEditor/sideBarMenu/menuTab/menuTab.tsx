import { ScrollArea } from "@/components/ui/scroll-area"
import { usePanel } from "@/contexts/PanelContext"
import { ComponentsTab } from "./items/ComponentsTab"
import { AssetsTab } from "./items/AssetsTab"
import type { ComponentType } from "@/types/core"

interface MenuTabProps {
    onAddComponent: (type: ComponentType) => void
}

export function MenuTab({ onAddComponent }: MenuTabProps) {
    const { activeTab: currentActiveTab } = usePanel()
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
                {currentActiveTab === 'components' ? (
                    <ComponentsTab onAddComponent={onAddComponent} />
                ) : (
                    <AssetsTab />
                )}
            </ScrollArea>
        </div>
    )
}