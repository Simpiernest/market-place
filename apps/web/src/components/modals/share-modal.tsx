"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Share2, Link2, Mail, Twitter, Facebook, Copy, CheckCircle2 } from "lucide-react"
import { useState } from "react"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  url: string
  title: string
}

export function ShareModal({
  isOpen,
  onClose,
  url,
  title,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] border-none shadow-2xl p-8 space-y-8">
        <DialogHeader className="space-y-2">
           <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
              <Share2 className="h-5 h-5" />
           </div>
           <DialogTitle className="text-2xl font-black uppercase italic text-primary">Share Listing.</DialogTitle>
           <DialogDescription className="font-medium text-muted-foreground">Invite collaborators or share this asset with your network.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
           <div className="flex gap-2">
              <div className="relative flex-1">
                 <Link2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                 <Input value={url} readOnly className="pl-9 h-11 bg-secondary/20 border-none font-medium text-xs" />
              </div>
              <Button onClick={handleCopy} className="bg-primary text-primary-foreground font-black uppercase text-[10px] h-11 px-6">
                 {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
           </div>

           <div className="grid grid-cols-4 gap-4">
              {[
                { icon: Mail, label: "Email" },
                { icon: Twitter, label: "X" },
                { icon: Facebook, label: "Facebook" },
                { icon: Share2, label: "More" },
              ].map((item) => (
                <button key={item.label} className="flex flex-col items-center gap-2 group cursor-pointer outline-none">
                   <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-all shadow-sm active:scale-95">
                      <item.icon className="h-5 w-5" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{item.label}</span>
                </button>
              ))}
           </div>
        </div>

        <div className="pt-6 border-t">
           <p className="text-[10px] text-muted-foreground leading-relaxed text-center font-medium">Sharing does not grant access to private data rooms or sensitive financial documents. Buyers must still sign an NDA.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
