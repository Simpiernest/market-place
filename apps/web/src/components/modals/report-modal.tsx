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
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, ShieldAlert } from "lucide-react"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  onReport: (reason: string, details: string) => void
  resourceName: string
}

export function ReportModal({
  isOpen,
  onClose,
  onReport,
  resourceName,
}: ReportModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] border-none shadow-2xl p-8 space-y-8">
        <DialogHeader className="space-y-2">
           <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
              <ShieldAlert className="h-5 h-5" />
           </div>
           <DialogTitle className="text-2xl font-black uppercase italic text-primary">Report <span className="text-destructive">Issue.</span></DialogTitle>
           <DialogDescription className="font-medium text-muted-foreground">Submit a concern regarding <span className="font-bold text-primary">{resourceName}</span> to our compliance team.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reason for Report</label>
              <select className="w-full h-11 rounded-xl border-2 border-secondary bg-transparent px-3 py-1 text-sm font-bold text-primary focus:border-destructive transition-all">
                 <option>Misrepresentation of financials</option>
                 <option>Spam or inappropriate content</option>
                 <option>Fraud or scam suspicion</option>
                 <option>Inappropriate messaging</option>
                 <option>Intellectual property violation</option>
                 <option>Other</option>
              </select>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Additional Details</label>
              <Textarea placeholder="Describe the issue in detail for our reviewers..." className="min-h-[120px] rounded-xl border-2 border-secondary" />
           </div>
        </div>

        <DialogFooter>
           <Button variant="ghost" onClick={onClose} className="font-bold uppercase text-[10px] tracking-widest">Cancel</Button>
           <Button className="bg-destructive text-white hover:bg-destructive/90 border-none font-black uppercase text-[10px] tracking-widest px-8 h-10 shadow-lg shadow-destructive/10">Submit Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
