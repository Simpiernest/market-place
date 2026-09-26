"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  Trash2,
  Eye,
  Lock,
  ShieldCheck,
  FolderPlus,
  ArrowLeft,
  ChevronRight,
  Plus,
  Download,
  MoreVertical,
  Users
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SellerDataRoomPage({ params }: { params: { id: string } }) {
  const [documents, setDocuments] = useState([
    { id: "1", name: "P&L Statement 2023.pdf", category: "Financials", size: "1.2 MB", status: "public" },
    { id: "2", name: "Tax Return 2023.pdf", category: "Legal", size: "2.4 MB", status: "private" },
    { id: "3", name: "Customer List (Anonymized).xlsx", category: "Operations", size: "850 KB", status: "private" },
    { id: "4", name: "Source Code Architecture.pdf", category: "Technology", size: "4.1 MB", status: "nda_required" },
  ]);

  const categories = ["Financials", "Legal", "Operations", "Technology", "Marketing"];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/seller">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Data Room</h1>
            <p className="text-muted-foreground mt-1">Listing: AI-Powered Customer Support SaaS</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Manage Permissions
          </Button>
          <Button className="bg-accent hover:bg-accent/90 border-none text-white">
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-4">
        {/* Sidebar categories */}
        <aside className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-4 mb-4">Categories</div>
          <Button variant="secondary" className="w-full justify-start font-bold">
            All Documents
            <span className="ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px]">4</span>
          </Button>
          {categories.map(cat => (
            <Button key={cat} variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary">
              {cat}
            </Button>
          ))}
          <Button variant="ghost" className="w-full justify-start text-accent hover:text-accent/80 mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </aside>

        {/* Main document list */}
        <div className="md:col-span-3 space-y-6">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/30 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold text-primary">Name</th>
                    <th className="px-6 py-3 text-left font-bold text-primary">Status</th>
                    <th className="px-6 py-3 text-left font-bold text-primary">Size</th>
                    <th className="px-6 py-3 text-right font-bold text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-secondary/10 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-bold text-primary">{doc.name}</div>
                            <div className="text-xs text-muted-foreground">{doc.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] uppercase font-bold tracking-widest",
                            doc.status === 'public' ? "border-green-500/20 text-green-600 bg-green-50" :
                            doc.status === 'private' ? "border-red-500/20 text-red-600 bg-red-50" :
                            "border-yellow-500/20 text-yellow-600 bg-yellow-50"
                          )}
                        >
                          {doc.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{doc.size}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Security Alert */}
          <div className="bg-primary text-primary-foreground p-6 rounded-2xl flex items-start gap-4 shadow-xl">
            <ShieldCheck className="w-8 h-8 text-accent shrink-0" />
            <div>
              <h3 className="font-bold text-lg">Secure Document Hosting</h3>
              <p className="text-primary-foreground/70 text-sm mt-1 leading-relaxed">
                All documents uploaded to the Data Room are encrypted at rest and in transit. Private documents are only accessible to buyers who have been manually granted access or have signed your listing's NDA.
              </p>
              <div className="mt-4 flex gap-4">
                <Button size="sm" className="bg-white text-primary hover:bg-white/90 border-none">Security Policy</Button>
                <Button size="sm" variant="outline" className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10">Configure NDA</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
