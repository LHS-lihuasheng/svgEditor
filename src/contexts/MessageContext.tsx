"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

interface MessageContextType {
    showMessage: boolean
    toggleShowMessage: () => void
    message: string
    setMessage: (value: string) => void
    tip: (message: string) => void
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export function MessageProvider({ children }: { children: ReactNode }) {
    const [showMessage, setShowMessage] = useState(false)
    const [message, setMessage] = useState('')

    const toggleShowMessage = () => {
        setShowMessage(prev => !prev)
    }

    const tip = (message: string) => {
        setMessage(message)
        toggleShowMessage()
    }

    return (
        <MessageContext.Provider value={{
            showMessage,
            toggleShowMessage,
            message,
            setMessage,
            tip
        }}>
            {children}
        </MessageContext.Provider>
    )
}

export function useMessage() {
    const context = useContext(MessageContext)
    if (context === undefined) {
        throw new Error("useMessage must be used within a MessageProvider")
    }
    return context
} 