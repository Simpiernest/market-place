import * as React from 'react';

export const Tabs = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const TabsList = ({ children }: { children: React.ReactNode }) => <div role="tablist">{children}</div>;
export const TabsTrigger = ({ children, value }: { children: React.ReactNode; value: string }) => <button data-value={value}>{children}</button>;
export const TabsContent = ({ children, value }: { children: React.ReactNode; value: string }) => <div data-value={value}>{children}</div>;