"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"

interface MessageContextType {
    showMessage: boolean
    toggleShowMessage: () => void
    message: string
    setMessage: (value: string) => void
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export function MessageProvider({ children }: { children: ReactNode }) {
    const [showMessage, setShowMessage] = useState(false)
    const [message, setMessage] = useState('')

    const toggleShowMessage = () => {
        setShowMessage(prev => !prev)
    }

    return (
        <MessageContext.Provider value={{
            showMessage,
            toggleShowMessage,
            message,
            setMessage
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