import { ScrollArea } from "@/components/ui/scroll-area"
import { usePanel } from "@/contexts/PanelContext"
import { ComponentsTab } from "@/components/svgEditor/SideBarMenu/menuTab/items/ComponentsTab"
import { AssetsTab } from '@/components/svgEditor/SideBarMenu/menuTab/items/AssetsTab'
import { PreviewTab } from "@/components/svgEditor/SideBarMenu/menuTab/items/PreviewTab"

export function MenuTab() {
    const { activeTab, isMenuBarOpen } = usePanel()

    // 根据不同的activeTab值返回不同的组件
    const renderActiveTabContent = () => {
        switch (activeTab) {
            case 'components':
                return <ComponentsTab />
            case 'assets':
                return <AssetsTab />
            case 'preview':
                return <PreviewTab />
            default:
                return <ComponentsTab />
        }
    }

    if (!isMenuBarOpen) return null;

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1  text-nowrap">
                {renderActiveTabContent()}
            </ScrollArea>
        </div>
    )
}