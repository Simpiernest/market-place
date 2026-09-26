import * as React from 'react';

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => <button>{children}</button>;
export const DropdownMenuContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DropdownMenuItem = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DropdownMenuSeparator = () => <hr />;
export const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;