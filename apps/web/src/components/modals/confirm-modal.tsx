"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  children?: React.ReactNode
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  children,
}: ConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-none shadow-2xl overflow-hidden p-0">
        <div className="bg-secondary/10 p-6 flex flex-col items-center text-center space-y-4 border-b">
           <div className={variant === 'destructive' ? "h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive" : "h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent"}>
              <AlertCircle className="h-6 h-6" />
           </div>
           <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl font-black uppercase italic text-primary">{title}</DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground">{description}</DialogDescription>
           </DialogHeader>
           {children}
        </div>
        <DialogFooter className="p-6 gap-3 sm:gap-0">
          <Button variant="ghost" onClick={onClose} className="font-bold uppercase text-[10px] tracking-widest">{cancelText}</Button>
          <Button
            variant={variant === 'destructive' ? "destructive" : "default"}
            onClick={() => { onConfirm(); onClose(); }}
            className="font-black uppercase text-[10px] tracking-widest px-8"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
