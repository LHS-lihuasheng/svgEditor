"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useMessage } from '@/contexts/MessageContext'
export function MessageModal() {
    const { showMessage, toggleShowMessage, message } = useMessage();

    return (
        <Dialog open={showMessage} onOpenChange={(open) => !open && toggleShowMessage()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>提示</DialogTitle>
                </DialogHeader>
                <DialogDescription className="py-4 whitespace-pre-wrap">
                    {message}
                </DialogDescription>
                <DialogFooter>
                    <Button onClick={toggleShowMessage}>关闭</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 