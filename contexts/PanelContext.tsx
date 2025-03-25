"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface PanelContextType {
    isParametersPanelOpen: boolean
    toggleParametersPanel: () => void
}

interface MenuBarContextType {
    isMenuBarOpen: boolean
    toggleMenuBar: () => void
    activeTab: 'components' | 'assets' | 'preview'
    setActiveTab: (tab: 'components' | 'assets' | 'preview') => void
}

interface CodePreviewContextType {
    showCodePreview: boolean
    toggleShowCodePreview: () => void
}

const PanelContext = createContext<PanelContextType & MenuBarContextType & CodePreviewContextType | undefined>(undefined)

export function PanelProvider({ children }: { children: ReactNode }) {
    const [isParametersPanelOpen, setIsParametersPanelOpen] = useState(true)
    const [isMenuBarOpen, setIsMenuBarOpen] = useState(true)
    const [activeTab, setActiveTab] = useState<'components' | 'assets' | 'preview'>('components')
    const [showCodePreview, setShowCodePreview] = useState(false)

    const toggleParametersPanel = () => {
        setIsParametersPanelOpen(prev => !prev)
    }

    const toggleMenuBar = () => {
        setIsMenuBarOpen(prev => !prev)
    }

    const toggleShowCodePreview = () => {
        setShowCodePreview(prev => !prev)
    }

    return (
        <PanelContext.Provider value={{
            isParametersPanelOpen,
            toggleParametersPanel,
            isMenuBarOpen,
            toggleMenuBar,
            activeTab,
            setActiveTab,
            showCodePreview,
            toggleShowCodePreview
        }}>
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