import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ThemeRenderer from "@/components/templates/ThemeRenderer";
import { WeddingInvitationData, ThemeId } from "@/types/wedding";

function getDemoWeddingData(slug: string): WeddingInvitationData | null {
  let themeId: string = "minang";
  let title = "Baralek Gadang Faisal & Putri";
  let groomName = "Faisal Bagindo Sutan, S.T";
  let groomNickname = "Faisal";
  let brideName = "Putri Rahmayani, S.Pd";
  let brideNickname = "Putri";
  let venueName = "Balai Pertemuan Nan Gadang, Padang";
  let address = "Jl. Khatib Sulaiman No. 50, Padang, Sumatera Barat";

  if (slug.includes("velvet") || slug.includes("burgundy")) {
    themeId = "velvet";
    title = "The Wedding of Versa & Mekar";
    groomName = "Versa Pratama, S.T.";
    groomNickname = "Versa";
    brideName = "Mekar Anggraini, S.Ds.";
    brideNickname = "Mekar";
    venueName = "Grand Ballroom Hotel Santika Bogor";
    address = "Botani Square Mall, Jl. Raya Padjadjaran, Kota Bogor";
  } else if (slug.includes("botanical") || slug.includes("versa") || slug === "versa-mekar") {
    themeId = "botanical";
    title = "The Wedding of Versa & Mekar";
    groomName = "Versa Pratama, S.T.";
    groomNickname = "Versa";
    brideName = "Mekar Anggraini, S.Ds.";
    brideNickname = "Mekar";
    venueName = "Grand Ballroom Hotel Santika Bogor";
    address = "Jl. Raya Padjadjaran, Tegallega, Kota Bogor, Jawa Barat";
  } else if (slug.includes("minang") || slug === "faisal-putri") {
    themeId = "minang";
    title = "Baralek Gadang Faisal & Putri";
    groomName = "Faisal Bagindo Sutan, S.T";
    groomNickname = "Faisal";
    brideName = "Putri Rahmayani, S.Pd";
    brideNickname = "Putri";
  } else if (slug.includes("adirara")) {
    themeId = "adirara";
    title = "Pernikahan Adi & Rara";
    groomName = "Adi Nugroho";
    groomNickname = "Adi";
    brideName = "Rara Ayu";
    brideNickname = "Rara";
    venueName = "Aula Masjid ABRI, Cimahi";
    address = "Jl. Gatot Subroto No. 45, Cimahi";
  } else if (slug.includes("royal")) {
    themeId = "royal";
    title = "Royal Wedding Rian & Sinta";
    groomName = "Rian Pratama, S.Kom";
    groomNickname = "Rian";
    brideName = "Sinta Anggraini, S.E";
    brideNickname = "Sinta";
    venueName = "Grand Ballroom Hotel Sahid, Surabaya";
    address = "Jl. Kusuma Bangsa No. 88, Surabaya";
  } else if (slug.includes("syari") || slug === "reza-farida") {
    themeId = "syari";
    title = "Walimatul Ursy Reza & Farida";
    groomName = "Reza Al-Fatih, Lc";
    groomNickname = "Reza";
    brideName = "Farida Nurul Hidayah";
    brideNickname = "Farida";
    venueName = "Masjid Raya Pondok Indah, Jakarta";
    address = "Jl. Lestari Indah No. 1, Jakarta Selatan";
  } else if (slug.includes("rustic")) {
    themeId = "rustic";
    title = "Pernikahan Dimas & Nadia";
    groomName = "Dimas Wicaksono";
    groomNickname = "Dimas";
    brideName = "Nadia Safitri";
    brideNickname = "Nadia";
    venueName = "Pine Forest Camp, Lembang";
    address = "Jl. Maribaya No. 120, Bandung Barat";
  } else if (slug.includes("minimalist")) {
    themeId = "minimalist";
    title = "The Wedding of Kevin & Cindy";
    groomName = "Kevin Jonathan";
    groomNickname = "Kevin";
    brideName = "Cindy Claudia";
    brideNickname = "Cindy";
    venueName = "Glass House Sentul, Bogor";
    address = "Jl. Raya Sentul Highland No. 9, Bogor";
  } else if (slug.startsWith("demo-") || slug === "rian-sinta") {
    themeId = "adirara";
    title = "Pernikahan Rian & Sinta";
    groomName = "Rian Pratama";
    groomNickname = "Rian";
    brideName = "Sinta Anggraini";
    brideNickname = "Sinta";
  } else {
    return null;
  }

  const isBotanical = themeId === "botanical";
  const isVersaMekar = slug.includes("versa") || slug.includes("botanical") || slug.includes("velvet");

  return {
    id: `demo-${slug}`,
    slug,
    title,
    themeId: themeId as ThemeId,
    isActive: true,
    coupleInfo: {
      groomName,
      groomNickname,
      groomFather: "Bpk. Bambang Wijaya",
      groomMother: "Ibu Sri Wahyuni",
      groomInstagram: "groom.instagram",
      groomPhoto: isVersaMekar
        ? "/uploads/couples/couples-1789565338842-mempelai-pria.jpg"
        : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      brideName,
      brideNickname,
      brideFather: "Bpk. Herman Santoso",
      brideMother: "Ibu Dewi Lestari",
      brideInstagram: "bride.instagram",
      bridePhoto: isVersaMekar
        ? "/uploads/couples/couples-1789565343459-mempelai-wanita.jpg"
        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      greetingMessage:
        "Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada momen sakral pernikahan kami.",
      desktopCoverImage: isVersaMekar
        ? "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=85"
        : undefined,
      stories: [
        {
          date: "14 Februari 2022",
          title: "Pertemuan Pertama",
          story: "Awal perjumpaan kami di sebuah kedai kopi di Bandung yang berlanjut menjadi diskusi tanpa henti.",
        },
        {
          date: "20 Mei 2024",
          title: "Komitmen Bersama",
          story: "Setelah melewati berbagai perjalanan, kami sepakat untuk melangkah ke jenjang yang lebih serius.",
        },
      ],
    },
    eventSchedules: [
      {
        id: "sch-1",
        eventName: isBotanical ? "Pemberkatan Kudus" : "Akad Nikah",
        date: "2026-10-24T08:00:00.000Z",
        startTime: "08:00",
        endTime: "10:00",
        venueName,
        address,
        mapsUrl: "https://maps.google.com",
      },
      {
        id: "sch-2",
        eventName: "Resepsi Pernikahan",
        date: "2026-10-24T11:00:00.000Z",
        startTime: "11:00",
        endTime: "14:00",
        venueName,
        address,
        mapsUrl: "https://maps.google.com",
      },
    ],
    galleries: [
      {
        id: "gal-1",
        imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
        caption: "Momen Bahagia 1",
        sortOrder: 0,
      },
      {
        id: "gal-2",
        imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
        caption: "Momen Bahagia 2",
        sortOrder: 1,
      },
      {
        id: "gal-3",
        imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
        caption: "Momen Bahagia 3",
        sortOrder: 2,
      },
    ],
    bankAccounts: [
      {
        id: "ba-1",
        bankName: "BCA",
        accountNumber: isVersaMekar ? "8020192831" : "8291039481",
        accountHolder: isVersaMekar ? "Versa Pratama" : groomName,
      },
      {
        id: "ba-2",
        bankName: "Mandiri",
        accountNumber: isVersaMekar ? "133009281920" : "1420019283741",
        accountHolder: isVersaMekar ? "Mekar Anggraini" : brideName,
      },
    ],
  };
}

export default function InvitationPage() {
  const params = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const slug = params.slug || "";
  const guestName = searchParams.get("to") || undefined;
  const theme = searchParams.get("theme") as ThemeId | undefined;

  const [data, setData] = useState<WeddingInvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    // Check demo data first
    const demo = getDemoWeddingData(slug);
    if (demo) {
      setData(demo);
      setLoading(false);
      document.title = `${demo.title} | Fasaro Wedding`;
      return;
    }

    // Fetch from backend API
    fetch(`/api/public/invitations/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Undangan tidak ditemukan");
        return r.json();
      })
      .then((json) => {
        if (json.data) {
          setData(json.data);
          document.title = `${json.data.title || "Undangan Pernikahan"} | Fasaro Wedding`;
        } else {
          setError(true);
        }
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F6FB] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Memuat undangan pernikahan...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F3F6FB] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-bold text-slate-900">Undangan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-600">
            Tautan undangan yang Anda buka tidak valid atau telah dinonaktifkan oleh pemiliknya.
          </p>
          <a
            href="/"
            className="inline-block py-2 px-4 rounded-lg bg-[#F97316] text-white text-xs font-semibold hover:bg-[#EA580C] transition-colors"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  return (
    <ThemeRenderer
      data={data}
      guestName={guestName}
      forcedThemeId={theme}
    />
  );
}
