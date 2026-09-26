"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  Bell,
  Lock,
  Globe,
  Shield,
  CreditCard,
  Laptop,
  Trash2,
  Languages,
  DollarSign,
  Users,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  MapPin,
  ChevronRight,
  LogOut,
  SmartphoneNfc,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api-client";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import { useUser } from "@/context/user-context";

export default function SettingsPage() {
  const { changeLanguage, lang: currentLang, t } = useTranslation();
  const { user, refreshUser } = useUser();
  const pathname = usePathname();
  const isSeller = pathname.includes("/dashboard/seller");

  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("Profile");
  const [showPassword, setShowPassword] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Form States
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    bio: "",
    location: "United States",
    timezone: "(GMT-5) Eastern Time"
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: false,
    login_notifications: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    messages: true,
    offers: true,
    price_changes: false,
    system_updates: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: "Only Verified Sellers",
    show_activity: true,
    data_sharing: true,
    marketing: false
  });

  const [paymentSettings, setPaymentSettings] = useState({
    preferred_currency: "USD",
    methods: ["Bank Transfer", "Credit / Debit Card"]
  });

  const [languageSetting, setLanguageSetting] = useState("en-US");

  useEffect(() => {
    if (user) {
        setProfileForm({
            full_name: user.full_name || "",
            bio: user.bio || "",
            location: user.profile?.location || user.location || "United States",
            timezone: user.profile?.timezone || user.timezone || "(GMT-5) Eastern Time"
        });

        setSecuritySettings({
            two_factor_enabled: user.two_factor_enabled || false,
            login_notifications: user.login_notifications || false
        });

        setNotificationSettings({
            email: user.notification_preferences?.email ?? true,
            messages: user.notification_preferences?.messages ?? true,
            offers: user.notification_preferences?.offers ?? true,
            price_changes: user.notification_preferences?.price_changes ?? false,
            system_updates: user.notification_preferences?.system_updates ?? false
        });

        setPrivacySettings({
            profile_visibility: user.privacy_settings?.profile_visibility || (isSeller ? "Only Verified Buyers" : "Only Verified Sellers"),
            show_activity: user.privacy_settings?.show_activity ?? true,
            data_sharing: user.privacy_settings?.data_sharing ?? true,
            marketing: user.privacy_settings?.marketing ?? false
        });

        setPaymentSettings({
            preferred_currency: user.preferred_currency || "USD",
            methods: ["Bank Transfer", "Credit / Debit Card"]
        });

        setLanguageSetting(user.language || "en-US");
    }
  }, [user, isSeller]);

  useEffect(() => {
    async function fetchSessions() {
        try {
            const sessionsData = await api.get("/auth/sessions").catch(() => []);
            setSessions(sessionsData);
        } catch (e) {}
        setIsLoading(false);
    }
    fetchSessions();
  }, []);

  const handleUpdateSettings = async (updates: any) => {
    setIsSaving(true);
    try {
        await api.patch("/auth/me", updates);
        await refreshUser(); // Refresh the global user context

        if (updates.language) {
            const langCode = updates.language.split('-')[0];
            changeLanguage(langCode as any);
        }

        alert("Institutional settings synchronized successfully.");
    } catch (e: any) {
        alert(e.message || "Failed to synchronize with backend.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
        alert("Passwords do not match.");
        return;
    }
    setIsSaving(true);
    try {
        await api.patch("/auth/me", { password: passwordData.new });
        await refreshUser();
        alert("Password updated successfully.");
        setPasswordData({ current: "", new: "", confirm: "" });
    } catch (e: any) {
        alert(e.message || "Failed to update password.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleRevokeSessions = async () => {
    try {
        await api.delete("/auth/sessions/revoke-others");
        alert("All other sessions have been revoked.");
        setSessions(prev => prev.filter(s => s.is_current));
    } catch (e) {
        alert("Failed to revoke sessions.");
    }
  };

  const tabs = [
    { id: "Profile", label: "Profile", icon: User },
    { id: "Security", label: "Security", icon: Shield },
    { id: "Password", label: "Password", icon: Lock },
    { id: "Sessions", label: "Sessions", icon: Laptop },
    { id: "Notifications", label: "Notifications", icon: Bell },
    { id: "Privacy", label: "Privacy", icon: Lock },
    { id: "Currency", label: isSeller ? "Payouts" : "Payment", icon: CreditCard },
    { id: "Language", label: "Language", icon: Languages },
  ];

  if (isLoading) {
    return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl pb-20">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-primary uppercase italic tracking-tight">{t("settings.title")}</h1>
        <p className="text-muted-foreground font-medium">{t("settings.subtitle")}</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-12">
         <aside className="lg:col-span-1 space-y-1.5 sticky top-24 h-fit">
            {tabs.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === item.id
                    ? "bg-accent text-white shadow-xl shadow-accent/20"
                    : "text-muted-foreground hover:bg-slate-100 hover:text-primary"
                )}
              >
                 <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-white" : "text-muted-foreground/60")} />
                 {item.id === "Profile" && t("common.profile")}
                 {item.id === "Security" && t("common.security")}
                 {item.id === "Password" && t("common.password")}
                 {item.id === "Sessions" && t("common.sessions")}
                 {item.id === "Notifications" && t("common.notifications")}
                 {item.id === "Privacy" && t("common.privacy")}
                 {item.id === "Currency" && (isSeller ? t("common.payouts") : t("common.payment"))}
                 {item.id === "Language" && t("common.language")}
              </button>
            ))}

            <div className="pt-6 mt-6 border-t border-slate-200">
               <button
                className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5 transition-all"
                onClick={() => { api.post("/auth/logout", {}).then(() => window.location.href = "/login") }}
               >
                  <LogOut className="w-4 h-4" />
                  {t("common.logout")}
               </button>
            </div>
         </aside>

         <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === "Profile" && (
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="bg-secondary/10 border-b p-8 sm:p-10">
                                <CardTitle className="text-xl font-black uppercase italic text-primary">{t("settings.profile_info")}</CardTitle>
                                <CardDescription className="text-xs font-bold text-muted-foreground">{t("settings.profile_desc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 sm:p-10 space-y-10">
                                <div className="grid gap-8 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("common.full_name")}</label>
                                        <Input
                                            value={profileForm.full_name}
                                            className="font-bold h-12 rounded-xl border-2"
                                            onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("common.email_address")}</label>
                                        <Input value={user?.email || ""} disabled className="bg-secondary/20 font-bold h-12 rounded-xl border-2 cursor-not-allowed" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("common.bio")}</label>
                                        <span className="text-[9px] font-bold text-muted-foreground/40">{profileForm.bio.length}/1000</span>
                                    </div>
                                    <textarea
                                        className="flex min-h-[150px] w-full rounded-2xl border-2 border-secondary bg-transparent px-4 py-3 text-sm shadow-sm font-medium focus:border-accent outline-none transition-all"
                                        value={profileForm.bio}
                                        onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                                        placeholder="Tell us about your background in business or investment..."
                                    />
                                </div>

                                <div className="grid gap-8 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("common.location")}</label>
                                        <div className="relative group">
                                            <select
                                                className="w-full h-12 rounded-xl border-2 bg-transparent pl-4 pr-10 font-bold text-sm outline-none focus:border-accent cursor-pointer appearance-none bg-white transition-all shadow-sm"
                                                value={profileForm.location}
                                                onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                                            >
                                                <option>United States</option>
                                                <option>Ghana</option>
                                                <option>Nigeria</option>
                                                <option>United Kingdom</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                <ChevronDown className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("common.timezone")}</label>
                                        <div className="relative group">
                                            <select
                                                className="w-full h-12 rounded-xl border-2 bg-transparent pl-4 pr-10 font-bold text-sm outline-none focus:border-accent cursor-pointer appearance-none bg-white transition-all shadow-sm"
                                                value={profileForm.timezone}
                                                onChange={(e) => setProfileForm({...profileForm, timezone: e.target.value})}
                                            >
                                                <option>(GMT-5) Eastern Time</option>
                                                <option>(GMT+0) Greenwich Mean Time</option>
                                                <option>(GMT+1) West Africa Time</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                <ChevronDown className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-secondary/5 border-t p-8 flex justify-end">
                                <Button
                                    className="bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest h-12 px-10 rounded-2xl shadow-xl shadow-accent/20 active:scale-95 transition-all"
                                    onClick={() => handleUpdateSettings({
                                        full_name: profileForm.full_name,
                                        bio: profileForm.bio,
                                        location: profileForm.location,
                                        timezone: profileForm.timezone
                                    })}
                                    loading={isSaving}
                                >
                                    {t("common.save_changes")}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {activeTab === "Security" && (
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="bg-secondary/10 border-b p-8 sm:p-10">
                                <CardTitle className="text-xl font-black uppercase italic text-primary">{t("settings.security_title")}</CardTitle>
                                <CardDescription className="text-xs font-bold text-muted-foreground">{t("settings.security_desc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 sm:p-10 space-y-10">
                                <div className="flex items-center justify-between py-2 border-b border-slate-50 pb-6">
                                    <div className="space-y-1">
                                        <div className="font-black text-primary uppercase italic text-sm">{t("settings.two_factor")}</div>
                                        <p className="text-xs text-muted-foreground font-medium">Add an extra layer of security to your account.</p>
                                    </div>
                                    <div
                                        className={cn(
                                            "w-12 h-6 rounded-full flex items-center p-1 transition-all cursor-pointer",
                                            securitySettings.two_factor_enabled ? "bg-green-500" : "bg-slate-200"
                                        )}
                                        onClick={() => setSecuritySettings({...securitySettings, two_factor_enabled: !securitySettings.two_factor_enabled})}
                                    >
                                        <motion.div
                                            animate={{ x: securitySettings.two_factor_enabled ? 24 : 0 }}
                                            className="w-4 h-4 bg-white rounded-full shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-slate-50 pb-6">
                                    <div className="space-y-1">
                                        <div className="font-black text-primary uppercase italic text-sm">{t("settings.login_notif")}</div>
                                        <p className="text-xs text-muted-foreground font-medium">Get notified about new device logins.</p>
                                    </div>
                                    <div
                                        className={cn(
                                            "w-12 h-6 rounded-full flex items-center p-1 transition-all cursor-pointer",
                                            securitySettings.login_notifications ? "bg-green-500" : "bg-slate-200"
                                        )}
                                        onClick={() => setSecuritySettings({...securitySettings, login_notifications: !securitySettings.login_notifications})}
                                    >
                                        <motion.div
                                            animate={{ x: securitySettings.login_notifications ? 24 : 0 }}
                                            className="w-4 h-4 bg-white rounded-full shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-slate-50 pb-6">
                                    <div className="space-y-1">
                                        <div className="font-black text-primary uppercase italic text-sm">{t("settings.trusted_devices")}</div>
                                        <p className="text-xs text-muted-foreground font-medium">Manage your trusted devices and browser fingerprints.</p>
                                    </div>
                                    <Button variant="outline" className="rounded-xl border-2 font-black uppercase text-[10px] h-10 px-6 cursor-pointer hover:bg-slate-50">{t("common.manage") || "Manage"}</Button>
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <div className="space-y-1">
                                        <div className="font-black text-primary uppercase italic text-sm">{t("settings.verification")}</div>
                                        <p className="text-xs text-muted-foreground font-medium">Verify your identity to unlock institutional features.</p>
                                    </div>
                                    <Badge className="bg-green-500 text-white border-none font-black uppercase text-[10px] h-9 px-5 rounded-full flex items-center gap-2 shadow-xl shadow-green-500/10">
                                        <ShieldCheck className="w-4 h-4" /> Verified
                                    </Badge>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-secondary/5 border-t p-8 flex justify-end">
                                <Button
                                    className="bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest h-12 px-10 rounded-2xl shadow-xl shadow-accent/20 transition-all active:scale-95"
                                    onClick={() => handleUpdateSettings({
                                        two_factor_enabled: securitySettings.two_factor_enabled,
                                        login_notifications: securitySettings.login_notifications
                                    })}
                                    loading={isSaving}
                                >
                                    {t("common.save_changes")}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {activeTab === "Password" && (
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="bg-secondary/10 border-b p-8 sm:p-10">
                                <CardTitle className="text-xl font-black uppercase italic text-primary">{t("settings.password_title")}</CardTitle>
                                <CardDescription className="text-xs font-bold text-muted-foreground">{t("settings.password_desc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 sm:p-10 space-y-8">
                                <div className="space-y-6 max-w-lg">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("settings.current_password")}</label>
                                        <div className="relative group">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                autoComplete="new-password"
                                                className="font-bold h-14 rounded-2xl border-2 focus:ring-accent/10"
                                                value={passwordData.current}
                                                onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                                            />
                                            <button
                                                className="absolute right-4 top-4 text-muted-foreground hover:text-accent transition-colors cursor-pointer"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("settings.new_password")}</label>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    autoComplete="new-password"
                                                    className="font-bold h-14 rounded-2xl border-2 focus:ring-accent/10"
                                                    value={passwordData.new}
                                                    onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("settings.confirm_password")}</label>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    autoComplete="new-password"
                                                    className="font-bold h-14 rounded-2xl border-2 focus:ring-accent/10"
                                                    value={passwordData.confirm}
                                                    onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-secondary/20 p-6 rounded-[2rem] border border-secondary space-y-4 self-start mt-6">
                                            <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Requirements:</div>
                                            <div className="space-y-2">
                                                {[
                                                    { label: "At least 8 characters", met: passwordData.new.length >= 8 },
                                                    { label: "One uppercase letter", met: /[A-Z]/.test(passwordData.new) },
                                                    { label: "One lowercase letter", met: /[a-z]/.test(passwordData.new) },
                                                    { label: "One number", met: /[0-9]/.test(passwordData.new) },
                                                    { label: "One special character", met: /[^A-Za-z0-9]/.test(passwordData.new) },
                                                ].map(item => (
                                                    <div key={item.label} className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all",
                                                            item.met ? "bg-green-500 border-green-500 text-white" : "bg-white border-slate-200"
                                                        )}>
                                                            {item.met && <CheckCircle2 className="w-2.5 h-2.5" />}
                                                        </div>
                                                        <span className={cn("text-[9px] font-bold uppercase tracking-tight", item.met ? "text-primary" : "text-muted-foreground")}>{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-secondary/5 border-t p-8 flex justify-end">
                                <Button
                                    className="bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest h-14 px-12 rounded-[2rem] shadow-2xl shadow-accent/20 transition-all active:scale-95"
                                    onClick={handleUpdatePassword}
                                    loading={isSaving}
                                    disabled={!passwordData.new || passwordData.new !== passwordData.confirm}
                                >
                                    Update Password
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {activeTab === "Sessions" && (
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="bg-secondary/10 border-b p-8 sm:p-10">
                                <CardTitle className="text-xl font-black uppercase italic text-primary">{t("settings.sessions_title")}</CardTitle>
                                <CardDescription className="text-xs font-bold text-muted-foreground">{t("settings.sessions_desc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left min-w-[600px]">
                                        <thead className="bg-secondary/30 border-b text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                            <tr>
                                                <th className="px-8 py-5">Device / Location</th>
                                                <th className="px-8 py-5">IP Address</th>
                                                <th className="px-8 py-5">Last Active</th>
                                                <th className="px-8 py-5 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {sessions.length > 0 ? sessions.map((session, i) => (
                                                <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-colors shadow-inner">
                                                                {session.device_info?.includes("Mobile") ? <SmartphoneNfc className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-black text-primary uppercase italic">{session.device_info || "Browser Session"}</div>
                                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{session.location || "Unknown Location"}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-xs font-mono text-muted-foreground">{session.ip_address}</td>
                                                    <td className="px-8 py-6 text-xs font-bold text-primary italic uppercase">
                                                        {session.last_activity_at ? new Date(session.last_activity_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t("common.current")}
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <Badge className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded-full", session.is_active ? 'bg-accent text-white shadow-lg shadow-accent/10' : 'bg-secondary text-primary')}>
                                                            {session.is_active ? t("common.current") : t("common.expired")}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="p-12 text-center text-muted-foreground italic text-xs font-bold uppercase tracking-widest opacity-40">No active sessions found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-secondary/5 border-t p-8">
                                <Button
                                    variant="outline"
                                    className="text-xs font-black uppercase text-destructive border-destructive/20 hover:bg-destructive/5 rounded-xl h-11 px-8 transition-all cursor-pointer active:scale-95"
                                    onClick={handleRevokeSessions}
                                >
                                    {t("settings.revoke_sessions")}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {activeTab === "Notifications" && (
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="bg-secondary/10 border-b p-8 sm:p-10">
                                <CardTitle className="text-xl font-black uppercase italic text-primary">{t("settings.notifications_title")}</CardTitle>
                                <CardDescription className="text-xs font-bold text-muted-foreground">{t("settings.notifications_desc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 sm:p-10 space-y-10">
                                {[
                                    { label: t("settings.notifications_email"), desc: t("settings.notifications_email_desc"), key: "email" },
                                    { label: t("settings.notifications_messages"), desc: t("settings.notifications_messages_desc"), key: "messages" },
                                    { label: t("settings.notifications_offers"), desc: t("settings.notifications_offers_desc"), key: "offers" },
                                    { label: t("settings.notifications_price"), desc: t("settings.notifications_price_desc"), key: "price_changes" },
                                    { label: t("settings.notifications_system"), desc: t("settings.notifications_system_desc"), key: "system_updates" },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between group">
                                        <div className="space-y-1">
                                            <div className="font-black text-primary uppercase italic text-sm group-hover:text-accent transition-colors">{item.label}</div>
                                            <p className="text-xs text-muted-foreground font-medium max-w-md">{item.desc}</p>
                                        </div>
                                        <div
                                            className={cn(
                                                "w-14 h-7 rounded-full flex items-center p-1 transition-all cursor-pointer",
                                                (notificationSettings as any)[item.key] ? "bg-accent shadow-lg shadow-accent/20" : "bg-slate-200"
                                            )}
                                            onClick={() => setNotificationSettings({...notificationSettings, [item.key]: !(notificationSettings as any)[item.key]})}
                                        >
                                            <motion.div
                                                animate={{ x: (notificationSettings as any)[item.key] ? 28 : 0 }}
                                                className="w-5 h-5 bg-white rounded-full shadow-md"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter className="bg-secondary/5 border-t p-8 flex justify-end">
                                <Button
                                    className="bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest h-12 px-10 rounded-2xl shadow-xl shadow-accent/20 transition-all active:scale-95"
                                    onClick={() => handleUpdateSettings({ notification_preferences: notificationSettings })}
                                    loading={isSaving}
                                >
                                    {t("common.save_changes")}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {activeTab === "Privacy" && (
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="bg-secondary/10 border-b p-8 sm:p-10">
                                <CardTitle className="text-xl font-black uppercase italic text-primary">{t("settings.privacy_title")}</CardTitle>
                                <CardDescription className="text-xs font-bold text-muted-foreground">{t("settings.privacy_desc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 sm:p-10 space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("settings.profile_visibility")}</label>
                                    <div className="relative group">
                                        <select
                                            className="w-full h-14 rounded-2xl border-2 bg-transparent pl-5 pr-12 font-black text-sm outline-none focus:border-accent italic text-primary cursor-pointer appearance-none bg-white transition-all shadow-sm"
                                            value={privacySettings.profile_visibility}
                                            onChange={(e) => setPrivacySettings({...privacySettings, profile_visibility: e.target.value})}
                                        >
                                            <option>{isSeller ? "Only Verified Buyers" : "Only Verified Sellers"}</option>
                                            <option>Public (Visible to All)</option>
                                            <option>Incognito (Private)</option>
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-accent transition-colors">
                                            <ChevronDown className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic font-medium px-1">Who can see your profile information.</p>
                                </div>

                                {[
                                    { label: t("settings.activity_status"), desc: t("settings.activity_status_desc"), key: "show_activity" },
                                    { label: t("settings.data_sharing"), desc: t("settings.data_sharing_desc"), key: "data_sharing" },
                                    { label: t("settings.marketing"), desc: t("settings.marketing_desc"), key: "marketing" },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between group">
                                        <div className="space-y-1">
                                            <div className="font-black text-primary uppercase italic text-sm group-hover:text-accent transition-colors">{item.label}</div>
                                            <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                                        </div>
                                        <div
                                            className={cn(
                                                "w-14 h-7 rounded-full flex items-center p-1 transition-all cursor-pointer",
                                                (privacySettings as any)[item.key] ? "bg-accent shadow-lg shadow-accent/20" : "bg-slate-200"
                                            )}
                                            onClick={() => setPrivacySettings({...privacySettings, [item.key]: !(privacySettings as any)[item.key]})}
                                        >
                                            <motion.div
                                                animate={{ x: (privacySettings as any)[item.key] ? 28 : 0 }}
                                                className="w-5 h-5 bg-white rounded-full shadow-md"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter className="bg-secondary/5 border-t p-8 flex justify-end">
                                <Button
                                    className="bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest h-12 px-10 rounded-2xl shadow-xl shadow-accent/20 transition-all active:scale-95"
                                    onClick={() => handleUpdateSettings({ privacy_settings: privacySettings })}
                                    loading={isSaving}
                                >
                                    {t("common.save_changes")}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {activeTab === "Currency" && (
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="bg-secondary/10 border-b p-8 sm:p-10">
                                <CardTitle className="text-xl font-black uppercase italic text-primary">{isSeller ? t("settings.payout_title") : t("settings.payment_title")}</CardTitle>
                                <CardDescription className="text-xs font-bold text-muted-foreground">{t("settings.payment_desc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 sm:p-10 space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("settings.default_currency")}</label>
                                    <div className="relative group">
                                        <select
                                            className="w-full h-14 rounded-2xl border-2 bg-transparent pl-5 pr-12 font-black text-sm outline-none focus:border-accent italic text-primary cursor-pointer appearance-none bg-white transition-all shadow-sm"
                                            value={paymentSettings.preferred_currency}
                                            onChange={(e) => setPaymentSettings({...paymentSettings, preferred_currency: e.target.value})}
                                        >
                                            <option value="USD">USD (US Dollar)</option>
                                            <option value="GHS">GHS (Ghanaian Cedi)</option>
                                            <option value="EUR">EUR (Euro)</option>
                                            <option value="GBP">GBP (British Pound)</option>
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-accent transition-colors">
                                            <ChevronDown className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic font-medium px-1">This will be used for all prices and transactions.</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("common.status") || "Status"}</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {["Bank Transfer", "Credit / Debit Card", "PayPal", "Stripe"].map(method => (
                                            <div key={method} className="flex items-center gap-4 p-5 rounded-2xl border-2 border-secondary bg-slate-50/50 hover:border-accent/30 transition-all cursor-pointer group">
                                                <Checkbox
                                                    id={method}
                                                    checked={paymentSettings.methods.includes(method)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setPaymentSettings({...paymentSettings, methods: [...paymentSettings.methods, method]});
                                                        else setPaymentSettings({...paymentSettings, methods: paymentSettings.methods.filter(m => m !== method)});
                                                    }}
                                                    className="h-5 w-5 rounded-md border-slate-300 data-[state=checked]:bg-accent"
                                                />
                                                <label htmlFor={method} className="text-xs font-black text-primary uppercase tracking-widest cursor-pointer group-hover:text-accent transition-colors">{method}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-secondary/5 border-t p-8 flex justify-end">
                                <Button
                                    className="bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest h-12 px-10 rounded-2xl shadow-xl shadow-accent/20 transition-all active:scale-95"
                                    onClick={() => handleUpdateSettings({ preferred_currency: paymentSettings.preferred_currency })}
                                    loading={isSaving}
                                >
                                    {t("common.save_changes")}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {activeTab === "Language" && (
                        <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="bg-secondary/10 border-b p-8 sm:p-10">
                                <CardTitle className="text-xl font-black uppercase italic text-primary">{t("settings.language_title")}</CardTitle>
                                <CardDescription className="text-xs font-bold text-muted-foreground">{t("settings.language_desc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 sm:p-10 space-y-10">
                                <div className="space-y-4 max-w-md">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("settings.interface_language")}</label>
                                    <div className="relative group">
                                        <select
                                            className="w-full h-14 rounded-2xl border-2 bg-transparent pl-5 pr-12 font-black text-sm outline-none focus:border-accent italic text-primary cursor-pointer appearance-none bg-white transition-all shadow-sm"
                                            value={languageSetting}
                                            onChange={(e) => setLanguageSetting(e.target.value)}
                                        >
                                            <option value="en-US">English (US)</option>
                                            <option value="fr-FR">French (FR)</option>
                                            <option value="es-ES">Spanish (ES)</option>
                                            <option value="de-DE">German (DE)</option>
                                            <option value="ar-SA">Arabic (SA)</option>
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-accent transition-colors">
                                            <ChevronDown className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic font-medium px-1">This will change the language used across the platform.</p>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-secondary/5 border-t p-8 flex justify-end">
                                <Button
                                    className="bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest h-12 px-10 rounded-2xl shadow-xl shadow-accent/20 transition-all active:scale-95"
                                    onClick={() => handleUpdateSettings({ language: languageSetting })}
                                    loading={isSaving}
                                >
                                    {t("common.save_changes")}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </motion.div>
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
