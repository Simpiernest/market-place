"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, MoreVertical, ShieldCheck, UserX, UserCheck, ShieldAlert, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { format } from "date-fns";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const data = await api.get("/admin/users");
        setUsers(data);
      } catch (e) {
        console.error("Failed to fetch users");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
        <div className="h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase italic">User <span className="text-accent">Management.</span></h1>
          <p className="text-muted-foreground font-medium">Oversee identity verification and access control.</p>
        </div>
        <Button className="bg-primary text-primary-foreground font-black uppercase tracking-widest px-8">
           Export User Data
        </Button>
      </div>

      <div className="flex gap-4 items-center">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, email, or ID..."
              className="pl-9 h-11 rounded-xl bg-white font-bold"
            />
         </div>
         <Button variant="outline" className="h-11 px-6 rounded-xl font-bold border-2">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
         </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden rounded-3xl">
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-secondary/30 border-b text-primary font-black uppercase tracking-widest text-[10px]">
                  <tr>
                     <th className="px-6 py-4">User</th>
                     <th className="px-6 py-4">Role</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4">Verification</th>
                     <th className="px-6 py-4">Joined</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-secondary/5 transition-colors group">
                       <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-black text-primary uppercase tracking-tighter shadow-inner italic">
                                {user.full_name?.split(' ').map((n: string) => n[0]).join('')}
                             </div>
                             <div>
                                <div className="font-bold text-primary uppercase italic text-xs tracking-tight">{user.full_name}</div>
                                <div className="text-[10px] text-muted-foreground font-medium uppercase">{user.email}</div>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-1">
                            {user.roles?.map((r: any) => (
                                <span key={r.role} className="text-[8px] font-black uppercase tracking-widest bg-accent/5 text-accent px-1.5 py-0.5 rounded border border-accent/10">{r.role}</span>
                            ))}
                          </div>
                       </td>
                       <td className="px-6 py-5">
                          <Badge variant="outline" className={cn(
                            "text-[8px] font-black uppercase tracking-widest",
                            user.is_active ? "border-green-500/20 text-green-600 bg-green-50" : "border-destructive/20 text-destructive bg-destructive/5"
                          )}>
                             {user.is_active ? 'Active' : 'Suspended'}
                          </Badge>
                       </td>
                       <td className="px-6 py-5">
                          {user.email_verified ? (
                            <div className="flex items-center gap-1.5 text-accent font-black uppercase text-[9px] tracking-tighter">
                               <ShieldCheck className="h-3 w-3" />
                               Verified
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-muted-foreground/40 font-black uppercase text-[9px] tracking-tighter">
                               <ShieldAlert className="h-3 w-3" />
                               Unverified
                            </div>
                          )}
                       </td>
                       <td className="px-6 py-5 text-muted-foreground font-black uppercase text-[9px]">{format(new Date(user.created_at), "MMM dd, yyyy")}</td>
                       <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button variant="ghost" size="sm" className="font-black uppercase text-[9px] tracking-widest cursor-pointer">Edit</Button>
                             {user.is_active ? (
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive cursor-pointer hover:bg-destructive/5"><UserX className="h-4 w-4" /></Button>
                             ) : (
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 cursor-pointer hover:bg-green-50"><UserCheck className="h-4 w-4" /></Button>
                             )}
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
}
