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

interface UnsavedChangesModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  onDiscard: () => void
}

export function UnsavedChangesModal({
  isOpen,
  onClose,
  onSave,
  onDiscard,
}: UnsavedChangesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-none shadow-2xl overflow-hidden p-0">
        <div className="bg-amber-500/10 p-6 flex flex-col items-center text-center space-y-4 border-b border-amber-500/20">
           <div className="h-12 w-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <AlertCircle className="h-6 h-6" />
           </div>
           <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl font-black uppercase italic text-amber-900">Unsaved Changes.</DialogTitle>
              <DialogDescription className="font-medium text-amber-800/70 text-xs">You have unsaved changes in your listing wizard. Leaving now will result in data loss for this step.</DialogDescription>
           </DialogHeader>
        </div>
        <DialogFooter className="p-6 gap-3 sm:gap-0 flex-col sm:flex-row">
          <Button variant="ghost" onClick={onClose} className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground order-3 sm:order-1">Continue Editing</Button>
          <div className="flex gap-2 order-1 sm:order-2">
            <Button variant="outline" onClick={() => { onDiscard(); onClose(); }} className="font-black uppercase text-[10px] tracking-widest text-destructive hover:bg-destructive/5 border-destructive/20 h-10 px-6">Discard</Button>
            <Button onClick={() => { onSave(); onClose(); }} className="bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest h-10 px-8">Save Draft</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
