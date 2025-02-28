import { cn } from "@/lib/utils"

interface NavButtonProps {
    id: string
    label: string
    icon: any
    currentActiveTab: string
    handleTabChange: (tab: 'components' | 'assets' | 'parameters') => void
}

export function NavButton({ id, label, icon: Icon, currentActiveTab, handleTabChange }: NavButtonProps) {
    return (
        <button
            key={id}
            className={cn(
                "h-12 flex items-center justify-center hover:bg-gray-100 transition-colors",
                currentActiveTab === id && "bg-gray-100"
            )}
            onClick={() => handleTabChange(id as 'components' | 'assets' | 'parameters')}
            title={label}
        >
            <Icon className={cn(
                "h-5 w-5 transition-colors",
                currentActiveTab === id ? "text-primary" : "text-muted-foreground"
            )} />
        </button>
    )
}