import * as React from 'react';

export const Dialog = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DialogTrigger = ({ children }: { children: React.ReactNode }) => <button>{children}</button>;
export const DialogContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DialogHeader = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DialogTitle = ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>;
export const DialogDescription = ({ children }: { children: React.ReactNode }) => <p>{children}</p>;
export const DialogFooter = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;