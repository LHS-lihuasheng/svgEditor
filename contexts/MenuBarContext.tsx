import { createContext, useState, useContext } from "react";

interface MenuBarContextType {
    isMenuBarOpen: boolean
    setIsMenuBarOpen: (isOpen: boolean) => void
    activeTab: 'components' | 'parameters' | 'assets'
    setActiveTab: (tab: 'components' | 'parameters' | 'assets') => void
}

const MenuBarContext = createContext<MenuBarContextType | null>(null)

export function MenuBarProvider({ children }: { children: React.ReactNode }) {
    const [isMenuBarOpen, setIsMenuBarOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'components' | 'parameters' | 'assets'>('components')

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