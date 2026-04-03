"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, ArrowRight } from "lucide-react";
import { signup } from "../actions";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (password !== confirmPassword) {
      setErrorMessage("Password tidak cocok.");
      setLoading(false);
      return;
    }

    const result = await signup(formData);
    
    if (result?.error) {
      setErrorMessage(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[oklch(0.15_0.02_260)] via-[oklch(0.12_0.03_240)] to-[oklch(0.10_0.02_280)]">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-[oklch(0.75_0.15_200/10%)] blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-primary/10 blur-[80px]" />

        <div className="relative z-10 flex flex-col justify-center px-16 space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary glow-primary">
              <Zap className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">HR Automation</h1>
              <p className="text-xs text-muted-foreground">Rekrutmen Cerdas</p>
            </div>
          </div>

          <div className="space-y-4 max-w-md">
            <h2 className="text-3xl font-bold leading-tight text-white">
              Mulai Perjalanan{" "}
              <span className="gradient-text">Rekrutmen Modern</span> Anda
            </h2>
            <p className="text-white/60 leading-relaxed">
              Daftarkan perusahaan Anda dan rasakan kemudahan menyaring ratusan
              CV dalam hitungan menit dengan teknologi AI terdepan.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3 pt-2">
            {[
              "Screening CV otomatis dengan AI",
              "Dashboard analitik real-time",
              "Multi-channel ingestion (Email & Web Form)",
              "Keamanan data tingkat enterprise",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <span className="text-sm text-white/70">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary glow-primary">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold gradient-text">HR Automation</h1>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold">Buat Akun</h2>
            <p className="text-sm text-muted-foreground">
              Daftarkan perusahaan Anda untuk memulai
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-xs text-destructive animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullname">Nama Lengkap</Label>
              <Input id="fullname" name="fullname" placeholder="Nama lengkap Anda" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Nama Perusahaan</Label>
              <Input id="company" name="company" placeholder="PT Contoh Indonesia" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@perusahaan.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Minimal 8 karakter"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Konfirmasi Password</Label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                placeholder="Ulangi password"
                required
              />
            </div>

            <div className="flex items-start gap-2 pt-1">
              <Checkbox id="terms" className="mt-0.5" />
              <Label
                htmlFor="terms"
                className="text-xs font-normal text-muted-foreground cursor-pointer leading-relaxed"
              >
                Saya menyetujui{" "}
                <Link href="#" className="text-primary hover:underline">
                  Syarat & Ketentuan
                </Link>{" "}
                dan{" "}
                <Link href="#" className="text-primary hover:underline">
                  Kebijakan Privasi
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Daftar
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
