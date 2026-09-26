'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-secondary/5 flex flex-col items-center justify-center p-6 text-center space-y-8">
      <div className="h-20 w-20 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive shadow-lg shadow-destructive/10">
         <AlertCircle className="h-10 w-10" />
      </div>

      <div className="space-y-4 max-w-md">
         <h1 className="text-4xl font-extrabold tracking-tight text-primary uppercase italic">System <span className="text-destructive">Failure.</span></h1>
         <p className="text-lg text-muted-foreground font-medium">An unexpected error occurred while processing your request. Our team has been notified.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
         <Button
           size="lg"
           onClick={() => reset()}
           className="bg-primary text-primary-foreground font-black uppercase tracking-widest px-8"
         >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Try Again
         </Button>
         <Link href="/">
            <Button size="lg" variant="outline" className="font-bold px-8">
               <Home className="w-4 h-4 mr-2" />
               Return Home
            </Button>
         </Link>
      </div>

      <div className="pt-8 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
         Error ID: {error.digest || 'BB-ERR-UNKNOWN'}
      </div>
    </div>
  )
}
