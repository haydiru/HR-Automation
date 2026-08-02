"use client";

import { use, useState, useEffect } from "react";
import {
  Zap,
  Upload,
  CheckCircle2,
  FileText,
  X,
  Plus,
  Trash2,
  GraduationCap,
  Briefcase,
  Wand2,
  Phone,
  Mail,
  User,
  MapPin,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MapPicker } from "@/components/ui/map-picker";
import { useLanguage } from "@/context/language-context";

interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  duration: string;
}

export default function PublicApplyPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const { t } = useLanguage();
  const [job, setJob] = useState<any>(null);
  const [loadingJob, setLoadingJob] = useState(true);

  const [submitted, setSubmitted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [educations, setEducations] = useState<Education[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState("");
  const [domicileLocation, setDomicileLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (res.ok) setJob(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingJob(false);
      }
    }
    fetchJob();
  }, [jobId]);

  if (loadingJob) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3 p-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs font-medium text-muted-foreground">Loading job position details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-muted/30 flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold">Job Position Not Found</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This link may no longer be active or the job position has been closed by the company.
          </p>
        </div>
      </div>
    );
  }

  const addEducation = () => {
    setEducations([
      ...educations,
      { id: Date.now().toString(), school: "", degree: "", year: "" },
    ]);
  };

  const removeEducation = (id: string) => {
    setEducations(educations.filter((e) => e.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducations(
      educations.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      { id: Date.now().toString(), company: "", position: "", duration: "" },
    ]);
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter((e) => e.id !== id));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperiences(
      experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload your Curriculum Vitae (PDF).");
      return;
    }
    
    if (job?.distance_mandatory && (!domicileLocation || !domicileLocation.address)) {
      alert("Important: This position requires domicile distance verification. Please pinpoint your residence location on the map.");
      return;
    }
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append("job_id", jobId);
    formData.append("full_name", fullname);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("cv_file", file);

    if (domicileLocation) {
      formData.append("domicile_latitude", String(domicileLocation.lat));
      formData.append("domicile_longitude", String(domicileLocation.lng));
      formData.append("domicile_address", domicileLocation.address);
    }
    
    try {
      const res = await fetch("/api/webhook/ingest", {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        setSubmitted(true);
      } else {
        const error = await res.json();
        alert(`Failed to submit application: ${error.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 page-enter">
        <div className="relative z-10 text-center space-y-5 p-6 sm:p-8 max-w-md rounded-2xl border border-border/80 bg-card shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold">Application Submitted Successfully!</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Thank you for applying for the position of{" "}
            <span className="font-bold text-foreground">{job.title}</span>.
            Your application documents have entered our AI Screening pipeline and our HR team will review them shortly.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="mt-2 text-xs rounded-xl w-full">
            Submit Another Application
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-20 page-enter">
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-extrabold tracking-tight">Obsidian Talent OS</h1>
          </div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
            Official Application Portal
          </p>
        </div>

        {/* Job Info Hero Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-8 space-y-5 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{job.title}</h2>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
            <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Position Status
              </p>
              <p className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active & Open
              </p>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl bg-primary/5 border border-primary/15 space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Automated Assessment
              </p>
              <p className="text-xs font-bold text-primary flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                AI Screening Active
              </p>
            </div>
          </div>

          {job.work_address && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-muted/20 border border-border/60 space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Workplace Location
              </p>
              <p className="text-xs font-bold text-foreground">
                {job.work_address}
              </p>
              {job.max_distance && (
                <p className="text-[11px] text-muted-foreground pt-1">
                  Domicile Distance Limit: <span className="font-mono text-primary font-bold">{job.max_distance} KM</span> 
                  {job.distance_mandatory ? (
                    <span className="text-destructive font-bold"> (Mandatory Requirement)</span>
                  ) : (
                    <span className="text-emerald-500 font-bold"> (Bonus Requirement)</span>
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Biodata */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <User className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">1. Applicant Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="fullname" className="text-xs font-semibold">Full Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="fullname" 
                  placeholder="e.g. John Doe" 
                  className="text-xs h-9 rounded-xl" 
                  required 
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">Email Address <span className="text-red-500">*</span></Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="johndoe@email.com" 
                  className="text-xs h-9 rounded-xl" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="phone" className="text-xs font-semibold">Phone / WhatsApp Number <span className="text-red-500">*</span></Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="+1 555-xxxx-xxxx" 
                  className="text-xs h-9 rounded-xl" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Domisili Map Picker */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">2. Residence / Domicile Location</h3>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pinpoint your current residence location coordinates on the map below.
            </p>

            <MapPicker
              value={domicileLocation}
              onChange={setDomicileLocation}
              label="Pinpoint Your Domicile Location"
            />
          </div>

          {/* Education */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">3. Educational Background</h3>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addEducation} className="h-7 text-xs rounded-lg gap-1">
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>

            <div className="space-y-3">
              {educations.map((edu) => (
                <div key={edu.id} className="p-4 rounded-xl border border-border/80 bg-muted/20 relative group">
                  <button
                    type="button"
                    onClick={() => removeEducation(edu.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-[10px] font-semibold uppercase">School / University</Label>
                      <Input
                        placeholder="e.g. Stanford University"
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                        className="text-xs h-8 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold uppercase">Degree / Major</Label>
                      <Input
                        placeholder="e.g. B.S. Computer Science"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                        className="text-xs h-8 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold uppercase">Graduation Year</Label>
                      <Input
                        placeholder="e.g. 2022"
                        value={edu.year}
                        onChange={(e) => updateEducation(edu.id, "year", e.target.value)}
                        className="text-xs h-8 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {educations.length === 0 && (
                <p className="text-center py-4 text-xs text-muted-foreground italic border border-dashed rounded-xl border-border/60">
                  Click Add to include your education history.
                </p>
              )}
            </div>
          </div>

          {/* Work Experience */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">4. Work Experience</h3>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addExperience} className="h-7 text-xs rounded-lg gap-1">
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>

            <div className="space-y-3">
              {experiences.map((exp) => (
                <div key={exp.id} className="p-4 rounded-xl border border-border/80 bg-muted/20 relative group">
                  <button
                    type="button"
                    onClick={() => removeExperience(exp.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-[10px] font-semibold uppercase">Company Name</Label>
                      <Input
                        placeholder="e.g. Tech Corp Inc."
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                        className="text-xs h-8 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold uppercase">Role / Position</Label>
                      <Input
                        placeholder="e.g. Frontend Engineer"
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                        className="text-xs h-8 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold uppercase">Duration (Years/Months)</Label>
                      <Input
                        placeholder="e.g. 2 Years 6 Months"
                        value={exp.duration}
                        onChange={(e) => updateExperience(exp.id, "duration", e.target.value)}
                        className="text-xs h-8 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {experiences.length === 0 && (
                <p className="text-center py-4 text-xs text-muted-foreground italic border border-dashed rounded-xl border-border/60">
                  Click Add to include work experience.
                </p>
              )}
            </div>
          </div>

          {/* Upload CV */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Upload className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">5. Upload Curriculum Vitae (PDF) <span className="text-red-500">*</span></h3>
            </div>

            <div
              className={cn(
                "border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer",
                file
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/80 hover:border-primary/40 hover:bg-muted/20"
              )}
              onClick={() => document.getElementById("cv-upload")?.click()}
            >
              <input
                id="cv-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-primary shrink-0" />
                  <div className="text-left min-w-0">
                    <p className="text-xs font-bold truncate max-w-[180px] sm:max-w-[220px]">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="ml-2 p-1.5 rounded-lg bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-xs font-bold">Click to upload CV PDF document</p>
                  <p className="text-[10px] text-muted-foreground">PDF Format (Max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-xs font-bold shadow-xl shadow-primary/20 rounded-xl gap-2 justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing & Submitting Application...
              </>
            ) : (
              <>
                Submit Application Now
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-[10px] text-muted-foreground">
          Managed automatically by Obsidian Talent OS · DeepMind AI Screening System
        </p>
      </div>
    </div>
  );
}
