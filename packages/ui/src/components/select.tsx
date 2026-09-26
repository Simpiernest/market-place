/**
 * Placeholder exports for complex components that require Radix UI.
 * These are simplified versions. In production, install @radix-ui packages
 * and implement full versions with proper accessibility.
 */

// Select
export const Select = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const SelectTrigger = ({ children }: { children: React.ReactNode }) => <button>{children}</button>;
export const SelectValue = ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>;
export const SelectContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const SelectItem = ({ children, value }: { children: React.ReactNode; value: string }) => <div data-value={value}>{children}</div>;

// Tooltip
export const TooltipProvider = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const Tooltip = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const TooltipTrigger = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const TooltipContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

// Dropdown Menu
export const DropdownMenu = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => <button>{children}</button>;
export const DropdownMenuContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DropdownMenuItem = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DropdownMenuSeparator = () => <hr />;
export const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

// Tabs
export const Tabs = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const TabsList = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const TabsTrigger = ({ children, value }: { children: React.ReactNode; value: string }) => <button data-value={value}>{children}</button>;
export const TabsContent = ({ children, value }: { children: React.ReactNode; value: string }) => <div data-value={value}>{children}</div>;

// Dialog
export const Dialog = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DialogTrigger = ({ children }: { children: React.ReactNode }) => <button>{children}</button>;
export const DialogContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DialogHeader = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DialogTitle = ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>;
export const DialogDescription = ({ children }: { children: React.ReactNode }) => <p>{children}</p>;
export const DialogFooter = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;