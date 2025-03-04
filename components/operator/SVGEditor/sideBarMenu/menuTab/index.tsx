import { ScrollArea } from "@/components/ui/scroll-area"
import { useMenuBar } from "@/contexts/MenuBarContext"
import { ComponentsTab } from "./items/ComponentsTab"
import { AssetsTab } from "./items/AssetsTab/index"
import type { Component } from "@/types/atomicComponent"

interface MenuTabProps {
    onAddComponent: (type: Component['type'], position: { x: number; y: number }) => void
    selectedComponent: Component | null
    onUpdateComponent?: (component: Component) => void
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