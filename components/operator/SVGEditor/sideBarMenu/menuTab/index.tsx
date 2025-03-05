import { ScrollArea } from "@/components/ui/scroll-area"
import { useMenuBar } from "@/contexts/MenuBarContext"
import { ComponentsTab } from "./items/ComponentsTab"
import { AssetsTab } from "./items/AssetsTab/index"
import type { BaseComponent } from "@/types/atomicComponents/index"

interface MenuTabProps {
    onAddComponent: (type: BaseComponent['type']) => void
    selectedComponent: BaseComponent | null
    onUpdateComponent?: (component: BaseComponent) => void
}

export function MenuTab({ onAddComponent, selectedComponent, onUpdateComponent }: MenuTabProps) {
    const { activeTab: currentActiveTab } = useMenuBar()
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