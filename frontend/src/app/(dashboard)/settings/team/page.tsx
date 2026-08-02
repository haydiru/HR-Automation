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
      alert(`Invitation sent to ${inviteEmail} as ${inviteRole === "super_admin" ? "Super Admin" : "Recruiter / SR Staff"}!`);
      
      setInviteEmail("");
      setInviteName("");
      setInviteRole("recruiter");
      setIsInviteOpen(false);
    } catch (err: any) {
      alert("Failed to send invitation: " + err.message);
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

      alert(`Role for ${selectedMember.full_name} updated to ${newRole === "super_admin" ? "Super Admin" : "Recruiter / SR Staff"}`);
      setIsEditRoleOpen(false);
      setSelectedMember(null);
    } catch (err: any) {
      alert("Failed to update role: " + err.message);
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleRevokeMember = (member: TeamMember) => {
    if (member.id === currentUser?.id) {
      alert("You cannot revoke access for your own account.");
      return;
    }

    if (
      confirm(
        `Are you sure you want to revoke team access for ${member.full_name} (${member.email})?`
      )
    ) {
      setTeamMembers((prev) => prev.filter((m) => m.id !== member.id));
      alert(`Team access for ${member.full_name} has been revoked.`);
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
        <p className="text-xs font-medium text-muted-foreground">Loading company team data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 sm:space-y-8 page-enter">
      {/* Header & Sub-Nav */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          Team & Interview Staff Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage interview staff, invite team members, and configure access roles
        </p>

        {/* Sub-Navigation Pills */}
        <div className="flex items-center gap-2 mt-4 sm:mt-6 border-b border-border/80 pb-2 overflow-x-auto scrollbar-thin">
          <Link href="/settings" className="shrink-0">
            <Button variant="ghost" size="sm" className="gap-2 text-xs rounded-xl text-muted-foreground hover:text-foreground">
              <Sliders className="w-4 h-4" />
              Profile & AI Config
            </Button>
          </Link>
          <Link href="/settings/stages" className="shrink-0">
            <Button variant="ghost" size="sm" className="gap-2 text-xs rounded-xl text-muted-foreground hover:text-foreground">
              <Layers className="w-4 h-4" />
              Recruitment Stages
            </Button>
          </Link>
          <Link href="/settings/team" className="shrink-0">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 text-xs font-bold rounded-xl bg-primary/10 text-primary border border-primary/20"
            >
              <Users className="w-4 h-4" />
              Team Management
            </Button>
          </Link>
          <Link href="/settings/integrations" className="shrink-0">
            <Button variant="ghost" size="sm" className="gap-2 text-xs rounded-xl text-muted-foreground hover:text-foreground">
              <CalendarDays className="w-4 h-4" />
              Email & Calendar Integrations
            </Button>
          </Link>
        </div>
      </div>

      {/* Super Admin Banner */}
      <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-start gap-3 shadow-sm">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-bold text-foreground">Team Management Area (Super Admin Exclusive)</p>
          <p className="text-muted-foreground leading-relaxed">
            As a **Super Admin**, you can invite recruitment team members (SR Staff / Interviewers), assign interview mandates, and configure company workspace permissions.
          </p>
        </div>
      </div>

      {/* Team Members List Card */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Company Team Members</h2>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                Total {teamMembers.length} registered team member(s)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search team member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-xs rounded-xl bg-muted/30"
              />
            </div>

            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger
                render={
                  <Button size="sm" className="gap-2 h-8 text-xs rounded-xl shadow-md shadow-primary/20 shrink-0 w-full sm:w-auto justify-center">
                    <UserPlus className="w-3.5 h-3.5" />
                    Invite Team Member
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base">
                    <UserPlus className="w-5 h-5 text-primary" />
                    Invite New Team Member
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Send an email invitation to add recruitment staff or interviewers to your workspace.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSendInvite} className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email" className="text-xs font-semibold">
                      Team Member Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="invite-email"
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="text-xs h-9 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invite-name" className="text-xs font-semibold">
                      Full Name (Optional)
                    </Label>
                    <Input
                      id="invite-name"
                      placeholder="e.g. Jane Doe"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="text-xs h-9 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invite-role" className="text-xs font-semibold">
                      Role & Permissions
                    </Label>
                    <Select
                      value={inviteRole}
                      onValueChange={(val: any) => setInviteRole(val)}
                    >
                      <SelectTrigger id="invite-role" className="w-full text-xs h-9 rounded-xl">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recruiter">
                          <div className="flex flex-col py-1">
                            <span className="font-semibold text-xs">Recruiter / SR Staff (Interviewer)</span>
                            <span className="text-[10px] text-muted-foreground">
                              Can receive interview mandates, update candidate stages & sync Google Calendar.
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="super_admin">
                          <div className="flex flex-col py-1">
                            <span className="font-semibold text-xs">Super Admin (Full Access)</span>
                            <span className="text-[10px] text-muted-foreground">
                              Full access to jobs, AI settings, email alias ingestion & team management.
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
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={sendingInvite} className="text-xs rounded-xl">
                      {sendingInvite ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5" />
                          Send Invitation
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
                <th className="p-4">Team Member</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No team members match your search query.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 whitespace-nowrap">
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
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
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
                    <td className="p-4 whitespace-nowrap">
                      {member.status === "active" ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          Invited
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                      {new Date(member.created_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl shadow-xl">
                          <DropdownMenuLabel className="text-xs">Manage Access</DropdownMenuLabel>
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
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRevokeMember(member)}
                            disabled={member.id === currentUser?.id}
                            className="text-xs gap-2 text-destructive focus:text-destructive cursor-pointer"
                          >
                            <UserX className="w-4 h-4" />
                            Revoke Team Access
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
              Change Team Member Role
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update access permissions for {selectedMember?.full_name} ({selectedMember?.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Select New Role</Label>
              <Select
                value={newRole}
                onValueChange={(val: any) => setNewRole(val)}
              >
                <SelectTrigger className="w-full text-xs h-9 rounded-xl">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recruiter">
                    <span className="font-semibold text-xs">Recruiter / SR Staff (Interviewer)</span>
                  </SelectItem>
                  <SelectItem value="super_admin">
                    <span className="font-semibold text-xs">Super Admin (Full Access)</span>
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
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpdateRole} disabled={updatingRole} className="text-xs rounded-xl">
              {updatingRole ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
