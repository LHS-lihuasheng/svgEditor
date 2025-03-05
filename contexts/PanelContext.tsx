"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface PanelContextType {
    isParametersPanelOpen: boolean
    setIsParametersPanelOpen: (value: boolean) => void
    toggleParametersPanel: () => void
}

interface MenuBarContextType {
    isMenuBarOpen: boolean
    toggleMenuBar: () => void
    activeTab: 'components' | 'assets'
    setActiveTab: (tab: 'components' | 'assets') => void
}

const PanelContext = createContext<PanelContextType & MenuBarContextType | undefined>(undefined)

export function PanelProvider({ children }: { children: ReactNode }) {
    const [isParametersPanelOpen, setIsParametersPanelOpen] = useState(true)
    const [isMenuBarOpen, setIsMenuBarOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'components' | 'assets'>('components')

    const toggleParametersPanel = () => {
        setIsParametersPanelOpen(prev => !prev)
    }

    const toggleMenuBar = () => {
        setIsMenuBarOpen(prev => !prev)
    }

    return (
        <PanelContext.Provider value={{ isParametersPanelOpen, setIsParametersPanelOpen, toggleParametersPanel, isMenuBarOpen, toggleMenuBar, activeTab, setActiveTab }}>
            {children}
        </PanelContext.Provider>
    )
}

export function usePanel() {
    const context = useContext(PanelContext)
    if (context === undefined) {
        throw new Error("usePanel must be used within a PanelProvider")
    }
    return context
} 