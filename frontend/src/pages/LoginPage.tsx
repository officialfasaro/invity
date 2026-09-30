import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Heart,
  Home,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

const ERROR_MESSAGE_MAP: Record<string, string> = {
  google_not_configured:
    "Google OAuth belum aktif di server. Tambahkan GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET di file .env.",
  google_access_denied: "Izin masuk akun Google dibatalkan atau ditolak.",
  google_auth_failed:
    "Gagal melakukan verifikasi akun Google. Silakan coba kembali atau gunakan email & kata sandi.",
  session_expired: "Sesi autentikasi kedaluwarsa. Silakan ulangi proses masuk.",
  invalid_oauth_response: "Respons autentikasi dari Google tidak valid.",
  csrf_state_mismatch: "Validasi keamanan sesi gagal. Silakan coba kembali.",
  google_email_missing: "Akun Google tidak menyediakan informasi email.",
  no_active_package:
    "Akun Anda belum memiliki paket undangan aktif. Silakan pilih dan selesaikan pembayaran paket terlebih dahulu untuk mengakses dashboard.",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("from") || "/dashboard";
  const modeParam = searchParams.get("mode");
  const planParam = (searchParams.get("plan") || searchParams.get("upgradeTier")) as
    | "STARTER"
    | "ELEGANT"
    | "ULTIMATE"
    | null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(modeParam === "register" || Boolean(planParam));
  const [selectedPlan, setSelectedPlan] = useState<"STARTER" | "ELEGANT" | "ULTIMATE" | null>(planParam);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const errorParam = searchParams.get("error");
  const detailsParam = searchParams.get("details");
  const baseParamMessage = errorParam
    ? ERROR_MESSAGE_MAP[errorParam] || "Terjadi kendala autentikasi"
    : null;
  const paramErrorMessage = baseParamMessage
    ? detailsParam
      ? `${baseParamMessage} (Detail: ${detailsParam})`
      : baseParamMessage
    : null;
  const activeErrorMessage = formError || paramErrorMessage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const endpoint = isRegisterMode ? "/api/auth/register" : "/api/auth/login";
    const payload = isRegisterMode
      ? { name: cleanName, email: cleanEmail, password, plan: selectedPlan || undefined }
      : { email: cleanEmail, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk");
      }

      if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else if (data.user?.hasActivePackage) {
        router.push(redirectTarget && redirectTarget !== "/login" ? redirectTarget : "/dashboard");
      } else {
        router.push("/order");
      }
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const googleAuthHref = `/api/auth/google?from=${encodeURIComponent(redirectTarget)}`;

  return (
    <div className="w-full max-w-md space-y-3">
      {/* Link Kembali ke Beranda */}
      <div className="flex items-center justify-between px-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#F97316] transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Kembali ke Beranda</span>
        </Link>
        <Link
          href="/"
          className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-[10px] font-black shadow-2xs">
            F
          </div>
          <span>Fasaro</span>
        </Link>
      </div>

      <div className="w-full p-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
        <div className="text-center mb-6">
          <div className="inline-flex p-2.5 rounded-xl bg-orange-50 text-[#F97316] border border-orange-100 mb-3">
            <Heart className="w-5 h-5 fill-[#F97316]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isRegisterMode ? "Daftar Akun Baru" : "Masuk ke Fasaro"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isRegisterMode
              ? "Mulai buat undangan pernikahan impian Anda dalam hitungan menit."
              : "Kelola undangan, pantau buku tamu, dan verifikasi kado digital."}
          </p>
        </div>

        {activeErrorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{activeErrorMessage}</div>
            </div>
            {(errorParam === "no_active_package" ||
              activeErrorMessage.includes("belum memiliki paket")) && (
              <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between">
                <span className="text-[11px] text-rose-600">Ingin melihat paket pernikahan?</span>
                <Link
                  href="/#pricing"
                  className="inline-flex items-center gap-1 font-bold text-[#F97316] hover:underline text-[11px]"
                >
                  <span>Lihat Pilihan Paket</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Google Login Button */}
        <div className="space-y-4">
          <a
            href={googleAuthHref}
            className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer no-underline"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>Lanjutkan dengan Akun Google</span>
          </a>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E2E8F0] w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider shrink-0">
              atau dengan email
            </span>
            <div className="border-t border-[#E2E8F0] w-full" />
          </div>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 mt-4">
          {isRegisterMode && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda..."
                    className="w-full py-2.5 px-3.5 pl-10 rounded-lg text-sm border border-[#E2E8F0] bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] focus:outline-none transition-colors"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-800">
                    Pilih Paket Undangan
                  </label>
                  <span className="text-[10px] text-slate-400">
                    (Bisa diubah di dashboard)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("STARTER")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPlan === "STARTER"
                        ? "border-[#F97316] bg-orange-50/70 ring-1 ring-orange-300"
                        : "border-[#E2E8F0] hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="text-[11px] font-bold text-slate-900">Starter</div>
                    <div className="text-xs font-extrabold text-[#F97316] mt-0.5">Rp 39rb</div>
                    <div className="text-[9px] text-slate-400 line-through">Rp 89rb</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan("ELEGANT")}
                    className={`p-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                      selectedPlan === "ELEGANT"
                        ? "border-[#F97316] bg-orange-50/70 ring-1 ring-orange-300"
                        : "border-[#E2E8F0] hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="text-[11px] font-bold text-slate-900">Elegant</div>
                    <div className="text-xs font-extrabold text-[#F97316] mt-0.5">Rp 149rb</div>
                    <div className="text-[9px] text-slate-400 line-through">Rp 249rb</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan("ULTIMATE")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPlan === "ULTIMATE"
                        ? "border-[#F97316] bg-orange-50/70 ring-1 ring-orange-300"
                        : "border-[#E2E8F0] hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="text-[11px] font-bold text-slate-900">Ultimate</div>
                    <div className="text-xs font-extrabold text-[#F97316] mt-0.5">Rp 279rb</div>
                    <div className="text-[9px] text-slate-400 line-through">Rp 499rb</div>
                  </button>
                </div>

                {selectedPlan ? (
                  <div className="p-2 rounded-lg bg-orange-50 border border-orange-200 text-slate-700 text-[11px] flex items-center justify-between">
                    <span>
                      Paket dipilih:{" "}
                      <strong className="text-[#F97316]">
                        Paket {selectedPlan}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(null)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                    >
                      Pilih nanti
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400">
                    Pilih salah satu paket atau pilih nanti setelah masuk ke dashboard.
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full py-2.5 px-3.5 pl-10 rounded-lg text-sm border border-[#E2E8F0] bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] focus:outline-none transition-colors"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter..."
                className="w-full py-2.5 px-3.5 pl-10 pr-10 rounded-lg text-sm border border-[#E2E8F0] bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] focus:outline-none transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>
              {isLoading
                ? "Memproses..."
                : isRegisterMode
                ? "Daftar Sekarang"
                : "Masuk ke Akun"}
            </span>
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setFormError(null);
            }}
            className="text-xs text-[#F97316] hover:underline font-medium cursor-pointer"
          >
            {isRegisterMode
              ? "Sudah punya akun? Masuk di sini"
              : "Belum punya akun? Buat akun baru"}
          </button>
        </div>
      </div>

      {/* Footer Back Link */}
      <div className="text-center pt-1">
        <Link
          href="/"
          className="text-[11px] text-slate-500 hover:text-[#F97316] inline-flex items-center gap-1.5 font-medium transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Ke Beranda Utama Fasaro</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#F3F6FB]">
      <Suspense fallback={<div className="text-xs text-slate-400">Memuat form login...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
