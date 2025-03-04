"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface ParametersPanelContextType {
    isPanelOpen: boolean
    setIsPanelOpen: (value: boolean) => void
    togglePanel: () => void
}

const ParametersPanelContext = createContext<ParametersPanelContextType | undefined>(undefined)

export function ParametersPanelProvider({ children }: { children: ReactNode }) {
    const [isPanelOpen, setIsPanelOpen] = useState(true)

    const togglePanel = () => {
        setIsPanelOpen(prev => !prev)
    }

    return (
        <ParametersPanelContext.Provider value={{ isPanelOpen, setIsPanelOpen, togglePanel }}>
            {children}
        </ParametersPanelContext.Provider>
    )
}

export function useParametersPanel() {
    const context = useContext(ParametersPanelContext)
    if (context === undefined) {
        throw new Error("useParametersPanel must be used within a ParametersPanelProvider")
    }
    return context
} 