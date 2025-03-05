import { ScrollArea } from "@/components/ui/scroll-area"
import { usePanel } from "@/contexts/PanelContext"
import { ComponentsTab } from "./items/ComponentsTab"
import { AssetsTab } from "./items/AssetsTab/AssetsTab"
import type { BaseComponent, ComponentType } from "@/types/core"

interface MenuTabProps {
    onAddComponent: (type: ComponentType) => void
    selectedComponent: BaseComponent | null
    onUpdateComponent?: (component: BaseComponent) => void
}

export function MenuTab({ onAddComponent, selectedComponent, onUpdateComponent }: MenuTabProps) {
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