"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Mail,
  MoreHorizontal,
  UserX,
  Shield,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  Building2,
  Sliders,
  CalendarDays,
  Layers,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: "super_admin" | "recruiter";
  status: "active" | "invited";
  created_at: string;
  avatar_url?: string;
}

export default function TeamSettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Invite Modal States
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"recruiter" | "super_admin">("recruiter");
  const [sendingInvite, setSendingInvite] = useState(false);

  // Edit Role Modal States
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState<"recruiter" | "super_admin">("recruiter");
  const [updatingRole, setUpdatingRole] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setCurrentProfile(profile);

        const { data: members } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: true });

        if (members && members.length > 0) {
          const formattedMembers: TeamMember[] = members.map((m: any) => ({
            id: m.id,
            email: m.email,
            full_name: m.full_name || m.email.split("@")[0],
            role: m.role || (m.id === user.id ? "super_admin" : "recruiter"),
            status: "active",
            created_at: m.created_at || new Date().toISOString(),
          }));

          setTeamMembers(formattedMembers);
        } else {
          setTeamMembers([
            {
              id: user.id,
              email: user.email!,
              full_name: profile?.full_name || "Super Admin",
              role: "super_admin",
              status: "active",
              created_at: new Date().toISOString(),
            },
          ]);
        }
      }
      setLoading(false);
    }

    loadData();
  }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setSendingInvite(true);

    try {
      const newMember: TeamMember = {
        id: `invite-${Date.now()}`,
        email: inviteEmail,
        full_name: inviteName || inviteEmail.split("@")[0],
        role: inviteRole,
        status: "invited",
        created_at: new Date().toISOString(),
      };

      setTeamMembers((prev) => [...prev, newMember]);
      alert(`Undangan berhasil dikirim ke ${inviteEmail} sebagai ${inviteRole === "super_admin" ? "Super Admin" : "Recruiter / SR Staff"}!`);
      
      setInviteEmail("");
      setInviteName("");
      setInviteRole("recruiter");
      setIsInviteOpen(false);
    } catch (err: any) {
      alert("Gagal mengirim undangan: " + err.message);
    } finally {
      setSendingInvite(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedMember) return;
    setUpdatingRole(true);

    try {
      setTeamMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMember.id ? { ...m, role: newRole } : m
        )
      );

      if (!selectedMember.id.startsWith("invite-")) {
        await supabase
          .from("profiles")
          .update({ role: newRole })
          .eq("id", selectedMember.id);
      }

      alert(`Role ${selectedMember.full_name} berhasil diubah menjadi ${newRole === "super_admin" ? "Super Admin" : "Recruiter / SR Staff"}`);
      setIsEditRoleOpen(false);
      setSelectedMember(null);
    } catch (err: any) {
      alert("Gagal mengubah role: " + err.message);
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleRevokeMember = (member: TeamMember) => {
    if (member.id === currentUser?.id) {
      alert("Anda tidak bisa mencabut akses akun Anda sendiri.");
      return;
    }

    if (
      confirm(
        `Apakah Anda yakin ingin mencabut akses tim dari ${member.full_name} (${member.email})?`
      )
    ) {
      setTeamMembers((prev) => prev.filter((m) => m.id !== member.id));
      alert(`Akses tim untuk ${member.full_name} telah dicabut.`);
    }
  };

  const filteredMembers = teamMembers.filter(
    (m) =>
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs font-medium text-muted-foreground">Memuat data tim perusahaan...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 page-enter">
      {/* Header & Sub-Nav */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          Pengaturan Tim & Staf Wawancara
        </h1>
        <p className="text-xs text-muted-foreground">
          Kelola daftar penguji, undang anggota tim baru, dan atur matriks hak akses
        </p>

        {/* Sub-Navigation Pills */}
        <div className="flex items-center gap-2 mt-6 border-b border-border/80 pb-2 overflow-x-auto scrollbar-thin">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-2 text-xs rounded-xl text-muted-foreground hover:text-foreground">
              <Sliders className="w-4 h-4" />
              Profil & AI Config
            </Button>
          </Link>
          <Link href="/settings/stages">
            <Button variant="ghost" size="sm" className="gap-2 text-xs rounded-xl text-muted-foreground hover:text-foreground">
              <Layers className="w-4 h-4" />
              Tahapan Rekrutmen
            </Button>
          </Link>
          <Link href="/settings/team">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 text-xs font-bold rounded-xl bg-primary/10 text-primary border border-primary/20"
            >
              <Users className="w-4 h-4" />
              Manajemen Tim
            </Button>
          </Link>
          <Link href="/settings/integrations">
            <Button variant="ghost" size="sm" className="gap-2 text-xs rounded-xl text-muted-foreground hover:text-foreground">
              <CalendarDays className="w-4 h-4" />
              Integrasi Email & Kalender
            </Button>
          </Link>
        </div>
      </div>

      {/* Super Admin Banner */}
      <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-start gap-3 shadow-sm">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-bold text-foreground">Area Pengelolaan Tim (Khusus Super Admin)</p>
          <p className="text-muted-foreground leading-relaxed">
            Sebagai **Super Admin**, Anda dapat mengundang anggota tim rekrutmen (SR Staff/Interviewer), membagikan mandat penugasan kandidat, dan mengonfigurasi hak akses perusahaan.
          </p>
        </div>
      </div>

      {/* Team Members List Card */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Anggota Tim Perusahaan</h2>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                Total {teamMembers.length} anggota tim terdaftar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari anggota tim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-xs rounded-xl bg-muted/30"
              />
            </div>

            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger
                render={
                  <Button size="sm" className="gap-2 h-8 text-xs rounded-xl shadow-md shadow-primary/20 shrink-0">
                    <UserPlus className="w-3.5 h-3.5" />
                    Undang Anggota Tim
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base">
                    <UserPlus className="w-5 h-5 text-primary" />
                    Undang Anggota Tim Baru
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Kirim undangan via email untuk menambahkan staf rekrutmen atau penguji wawancara ke workspace Anda.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSendInvite} className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email" className="text-xs font-semibold">
                      Alamat Email Anggota Tim <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="invite-email"
                      type="email"
                      required
                      placeholder="nama@perusahaan.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="text-xs h-9 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invite-name" className="text-xs font-semibold">
                      Nama Lengkap (Opsional)
                    </Label>
                    <Input
                      id="invite-name"
                      placeholder="Contoh: Budi Santoso"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="text-xs h-9 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invite-role" className="text-xs font-semibold">
                      Peran & Hak Akses (Role)
                    </Label>
                    <Select
                      value={inviteRole}
                      onValueChange={(val: any) => setInviteRole(val)}
                    >
                      <SelectTrigger id="invite-role" className="w-full text-xs h-9 rounded-xl">
                        <SelectValue placeholder="Pilih Peran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recruiter">
                          <div className="flex flex-col py-1">
                            <span className="font-semibold text-xs">Recruiter / SR Staff (Penguji Wawancara)</span>
                            <span className="text-[10px] text-muted-foreground">
                              Dapat menerima mandat wawancara, memperbarui kandidat, & sync Google Calendar.
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="super_admin">
                          <div className="flex flex-col py-1">
                            <span className="font-semibold text-xs">Super Admin (Akses Penuh)</span>
                            <span className="text-[10px] text-muted-foreground">
                              Akses penuh ke lowongan, AI settings, pengelola email & manajemen tim.
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <DialogFooter className="pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsInviteOpen(false)}
                      className="text-xs rounded-xl"
                    >
                      Batal
                    </Button>
                    <Button type="submit" size="sm" disabled={sendingInvite} className="text-xs rounded-xl">
                      {sendingInvite ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Mengirim...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5" />
                          Kirim Undangan
                        </span>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/20 border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-4">Anggota Tim</th>
                <th className="p-4">Peran (Role)</th>
                <th className="p-4">Status</th>
                <th className="p-4">Tanggal Bergabung</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Tidak ada anggota tim yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 border border-border">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                            {member.full_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground flex items-center gap-2">
                            {member.full_name}
                            {member.id === currentUser?.id && (
                              <span className="text-[10px] text-muted-foreground font-normal bg-muted px-1.5 py-0.5 rounded">
                                (Anda)
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {member.role === "super_admin" ? (
                        <Badge
                          variant="secondary"
                          className="gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-bold text-[10px]"
                        >
                          <Shield className="w-3 h-3" />
                          Super Admin
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-bold text-[10px]"
                        >
                          <Users className="w-3 h-3" />
                          Recruiter / SR Staff
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      {member.status === "active" ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Aktif
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          Undangan Terkirim
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground font-mono text-[11px]">
                      {new Date(member.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl shadow-xl">
                          <DropdownMenuLabel className="text-xs">Kelola Akses</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMember(member);
                              setNewRole(member.role);
                              setIsEditRoleOpen(true);
                            }}
                            className="text-xs gap-2 cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            Ubah Peran (Role)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRevokeMember(member)}
                            disabled={member.id === currentUser?.id}
                            className="text-xs gap-2 text-destructive focus:text-destructive cursor-pointer"
                          >
                            <UserX className="w-4 h-4" />
                            Cabut Akses Tim
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Ubah Peran Anggota Tim
            </DialogTitle>
            <DialogDescription className="text-xs">
              Ubah perizinan akses untuk {selectedMember?.full_name} ({selectedMember?.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Pilih Peran Baru</Label>
              <Select
                value={newRole}
                onValueChange={(val: any) => setNewRole(val)}
              >
                <SelectTrigger className="w-full text-xs h-9 rounded-xl">
                  <SelectValue placeholder="Pilih Peran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recruiter">
                    <span className="font-semibold text-xs">Recruiter / SR Staff (Penguji Wawancara)</span>
                  </SelectItem>
                  <SelectItem value="super_admin">
                    <span className="font-semibold text-xs">Super Admin (Akses Penuh Perusahaan)</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditRoleOpen(false)}
              className="text-xs rounded-xl"
            >
              Batal
            </Button>
            <Button size="sm" onClick={handleUpdateRole} disabled={updatingRole} className="text-xs rounded-xl">
              {updatingRole ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Menyimpan...
                </span>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
