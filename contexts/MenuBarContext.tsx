import { createContext, useState, useContext } from "react";

interface MenuBarContextType {
    isMenuBarOpen: boolean
    setIsMenuBarOpen: (isOpen: boolean) => void
    activeTab: 'components' | 'assets'
    setActiveTab: (tab: 'components' | 'assets') => void
}

const MenuBarContext = createContext<MenuBarContextType | null>(null)

export function MenuBarProvider({ children }: { children: React.ReactNode }) {
    const [isMenuBarOpen, setIsMenuBarOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'components' | 'assets'>('components')

    return (
        <MenuBarContext.Provider value={{ isMenuBarOpen, setIsMenuBarOpen, activeTab, setActiveTab }}>
            {children}
        </MenuBarContext.Provider>
    )
}

export function useMenuBar() {
    const context = useContext(MenuBarContext)
    if (!context) {
        throw new Error('useMenuBar must be used within a MenuBarProvider')
    }
    return context
}