import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ThemeRenderer from "@/components/templates/ThemeRenderer";
import { WeddingInvitationData, ThemeId } from "@/types/wedding";
import { useVisitorPresence } from "@/utils/useInvitationPresence";

function getDemoWeddingData(slug: string): WeddingInvitationData | null {
  const isWedding3D =
    slug === "demo-wedding-3d" ||
    slug === "wedding-3d" ||
    slug === "wedding-3d-template" ||
    slug === "demo-tema-5" ||
    slug === "tema-5" ||
    slug === "demo-3d-tema-01" ||
    slug === "3d-tema-01" ||
    slug === "demo-art-01" ||
    slug === "art-01" ||
    slug === "three-d";

  const isRakaAyu =
    !isWedding3D &&
    (slug === "demo-raka-ayu" ||
      slug === "raka-dan-ayu" ||
      slug === "raka-ayu" ||
      slug === "demo-royal-tema-01" ||
      slug === "royal-tema-01" ||
      slug === "royal" ||
      slug === "demo-tema-4" ||
      slug === "tema-4" ||
      slug === "demo-art-02" ||
      slug === "demo-art-06" ||
      slug === "demo-art-10");

  const isGothic =
    !isWedding3D &&
    !isRakaAyu &&
    (slug === "demo-gothic" ||
      slug === "gothic" ||
      slug === "demo-gothic-tema-01" ||
      slug === "gothic-tema-01" ||
      slug === "invisimple-l08" ||
      slug === "invisimple" ||
      slug === "l08" ||
      slug === "dark-gothic" ||
      slug === "vintage-gothic" ||
      slug === "demo-tema-3" ||
      slug === "tema-3" ||
      slug === "demo-art-03" ||
      slug === "demo-art-09");

  const isEditorial =
    !isWedding3D &&
    !isRakaAyu &&
    !isGothic &&
    (slug === "demo-editorial" ||
      slug === "demo-editorial-tema-01" ||
      slug === "editorial-tema-01" ||
      slug === "putri-andika" ||
      slug === "editorial" ||
      slug === "stitch-editorial" ||
      slug === "stitch_editorial" ||
      slug === "demo-tema-2" ||
      slug === "tema-2" ||
      slug === "demo-art-04" ||
      slug === "demo-art-08" ||
      slug === "demo-art-11");

  const isDemo =
    isWedding3D ||
    isRakaAyu ||
    isGothic ||
    isEditorial ||
    slug.startsWith("demo-") ||
    slug.startsWith("art-") ||
    slug === "versa-mekar" ||
    slug === "faisal-putri" ||
    slug === "rian-sinta" ||
    slug === "botanical" ||
    slug === "botanical-tema-01" ||
    slug === "demo-botanical-tema-01" ||
    slug === "demo-tema-1" ||
    slug === "demo-art-05" ||
    slug === "demo-art-07" ||
    slug === "demo-art-12" ||
    slug === "tema-1";
  if (!isDemo) return null;

  const themeId = isWedding3D
    ? "wedding-3d"
    : isRakaAyu
    ? "raka-ayu"
    : isGothic
    ? "gothic"
    : isEditorial
    ? "editorial"
    : "botanical";
  const title = isWedding3D || isRakaAyu
    ? "The Wedding of Raka & Ayu"
    : isGothic || isEditorial
    ? "The Wedding of Putri & Andika"
    : "The Wedding of Versa & Mekar";
  const groomName = isWedding3D || isRakaAyu
    ? "Raka Pratama, S.T."
    : isGothic || isEditorial
    ? "Putra Andika Pratama, S.T."
    : "Versa Pratama, S.T.";
  const groomNickname = isWedding3D || isRakaAyu ? "Raka" : isGothic || isEditorial ? "Andika" : "Versa";
  const brideName = isWedding3D || isRakaAyu
    ? "Ayu Lestari, S.Pd."
    : isGothic || isEditorial
    ? "Putri Cantika Sari, S.Ds."
    : "Mekar Anggraini, S.Ds.";
  const brideNickname = isWedding3D || isRakaAyu ? "Ayu" : isGothic || isEditorial ? "Putri" : "Mekar";
  const venueName = isWedding3D || isRakaAyu
    ? "Masjid Al-Ikhlas & Grand Ballroom Mawar"
    : isGothic || isEditorial
    ? "Menara 165 - Granada Ballroom"
    : "Grand Ballroom Hotel Santika Bogor";
  const address = isWedding3D || isRakaAyu
    ? "Jl. Melati Raya No. 45, Kebayoran Baru, Jakarta Selatan"
    : isGothic || isEditorial
    ? "Jl. TB Simatupang Kav. 1, Cilandak, Jakarta Selatan"
    : "Jl. Raya Padjadjaran, Tegallega, Kota Bogor, Jawa Barat";
  const isBotanical = !isWedding3D && !isRakaAyu && !isEditorial && !isGothic;
  const isVersaMekar = !isWedding3D && !isRakaAyu && !isEditorial && !isGothic;

  return {
    id: `demo-${slug}`,
    slug,
    title,
    themeId: themeId as ThemeId,
    isActive: true,
    musicUrl: "/music/wedding-romance.mp3",
    coupleInfo: {
      groomName,
      groomNickname,
      groomFather: isWedding3D || isRakaAyu
        ? "Bpk. Bambang Wijaya"
        : isGothic || isEditorial
        ? "Bpk. Deni Bastian"
        : "Bpk. Bambang Wijaya",
      groomMother: isWedding3D || isRakaAyu
        ? "Ibu Sri Rahayu"
        : isGothic || isEditorial
        ? "Ibu Aisha Dania"
        : "Ibu Sri Wahyuni",
      groomInstagram: isWedding3D || isRakaAyu
        ? "rakapratama"
        : isGothic || isEditorial
        ? "putraandika"
        : "groom.instagram",
      groomPhoto: isWedding3D
        ? "/templates/wedding-3d/groom.jpg"
        : isRakaAyu
        ? "/templates/raka-ayu/groom.jpg"
        : isGothic
        ? "/templates/gothic/groom.jpg"
        : isEditorial
        ? "/templates/editorial/groom.jpg"
        : "/templates/botanical/groom-versa.jpg",
      brideName,
      brideNickname,
      brideFather: isWedding3D || isRakaAyu
        ? "Bpk. Hendra Gunawan"
        : isGothic || isEditorial
        ? "Bpk. Abdul Rozak"
        : "Bpk. Herman Santoso",
      brideMother: isWedding3D || isRakaAyu
        ? "Ibu Siti Aminah"
        : isGothic || isEditorial
        ? "Ibu Adelia Marni"
        : "Ibu Dewi Lestari",
      brideInstagram: isWedding3D || isRakaAyu
        ? "ayulestari"
        : isGothic || isEditorial
        ? "putricantika"
        : "bride.instagram",
      bridePhoto: isWedding3D
        ? "/templates/wedding-3d/bride.jpg"
        : isRakaAyu
        ? "/templates/raka-ayu/bride.jpg"
        : isGothic
        ? "/templates/gothic/bride.jpg"
        : isEditorial
        ? "/templates/editorial/bride.jpg"
        : "/templates/botanical/bride-mekar.jpg",
      greetingMessage:
        "Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada momen sakral pernikahan kami.",
      desktopCoverImage: isWedding3D
        ? "/templates/wedding-3d/desktop-cover.jpg"
        : isRakaAyu
        ? "/templates/raka-ayu/desktop-cover.jpg"
        : isGothic
        ? "/templates/gothic/desktop-left.jpg"
        : isEditorial
        ? "/templates/editorial/cover.jpg"
        : "/templates/botanical/couple-center.jpg",
      backgroundImage: isWedding3D
        ? "/templates/wedding-3d/cover.jpg"
        : isRakaAyu
        ? "/templates/raka-ayu/cover.jpg"
        : isGothic
        ? "/templates/gothic/cover.jpg"
        : undefined,
      stories: [
        {
          date: "Bab I • 2020",
          title: "Ruang Temu & Secangkir Kopi",
          story: "Bermula dari sebuah proyek kolaborasi desain dan teknik arsitektur di Bandung. Di sela lembar sketsa dan diskusi gagasan, sebuah percakapan hangat membuka ruang bagi dua jiwa yang saling melengkapi.",
          imageUrl: "/templates/botanical/gallery/gallery-1.jpg",
        },
        {
          date: "Bab II • 2021",
          title: "Menapaki Jejak & Tawa",
          story: "Berbagi cerita di bawah rindangnya pepohonan Pinus Cikole. Kami menyadari bahwa kebahagiaan sejati hadir bukan dari kemewahan, melainkan dari tulusnya tawa di setiap langkah kebersamaan.",
          imageUrl: "/templates/botanical/gallery/gallery-4.jpg",
        },
        {
          date: "Bab III • 2022",
          title: "Ujian Jarak & Keteguhan",
          story: "Tuntutan pekerjaan sempat memisahkan kami dalam hitungan kilometer. Namun jarak justru menjadi guru terbaik yang mengajarkan arti saling percaya, menjaga doa di setiap sujud, dan merawat rindu.",
          imageUrl: "/templates/botanical/gallery/gallery-3.jpg",
        },
        {
          date: "Bab IV • 2023",
          title: "Merajut Asa & Bertumbuh",
          story: "Melalui dinamika cita-cita dan kedewasaan pikiran. Belajar mendengarkan serta meneguhkan hati dalam setiap langkah karier dan pendewasaan diri bersama untuk masa depan yang berkah.",
          imageUrl: "/templates/botanical/gallery/gallery-5.jpg",
        },
        {
          date: "Bab V • 2024",
          title: "Pertemuan Dua Keluarga",
          story: "Momen sakral ketika kedua keluarga besar duduk melingkar dalam kehangatan silaturahmi. Senyuman restu dari ayah dan ibu menjadi gerbang restu semesta yang paling menenteramkan sanubari kami.",
          imageUrl: "/templates/botanical/gallery/gallery-2.jpg",
        },
        {
          date: "Bab VI • 2025",
          title: "Satu Janji Selamanya",
          story: "Di bawah semburat hangat lembayung senja, sebuah cincin tersemat sebagai ikrar tulus untuk melangkah memasuki gerbang pernikahan suci, berpayung doa restu kedua orang tua tercinta.",
          imageUrl: "/templates/botanical/gallery/gallery-6.jpg",
        },
        {
          date: "Bab VII • 2026",
          title: "Menuju Gerbang Ijab Suci",
          story: "Hari demi hari kami lalui dengan penuh rasa syukur dan doa yang tak putus. Menyiapkan hari bahagia di mana dua janji terucap di hadapan Sang Maha Kuasa, memulai lembaran ibadah terpanjang dalam hidup kami.",
          imageUrl: "/templates/botanical/couple-center.jpg",
        },
        {
          date: "Bab VIII • Masa Depan",
          title: "Menua Bersama dalam Ridho-Nya",
          story: "Perjalanan ini adalah awal dari kisah abadi. Lembaran masa depan telah menanti untuk kita rangkai bersama dalam keteduhan cinta, kesabaran, dan keberkahan hingga ke jannah.",
          imageUrl: "/templates/botanical/bride-mekar.jpg",
        },
      ],
    },
    eventSchedules: [
      {
        id: "sch-1",
        eventName: isBotanical ? "Pemberkatan Kudus" : "Akad Nikah",
        date: isWedding3D || isRakaAyu
          ? "2026-12-12T08:00:00+07:00"
          : isGothic
          ? "2027-12-28T08:00:00+07:00"
          : "2026-10-24T08:00:00.000Z",
        startTime: "08:00 WIB",
        endTime: "10:00 WIB",
        venueName: isWedding3D || isRakaAyu ? "Masjid Agung Al-Ikhlas" : venueName,
        address,
        mapsUrl: isWedding3D || isRakaAyu
          ? "https://maps.google.com/?q=Jakarta"
          : "https://maps.google.com/?q=Menara+165+Jakarta",
      },
      {
        id: "sch-2",
        eventName: "Resepsi Pernikahan",
        date: isWedding3D || isRakaAyu
          ? "2026-12-12T11:00:00+07:00"
          : isGothic
          ? "2027-12-28T11:00:00+07:00"
          : "2026-10-24T11:00:00.000Z",
        startTime: "11:00",
        endTime: "14:00 WIB",
        venueName: isWedding3D || isRakaAyu
          ? "Grand Ballroom Mawar"
          : isGothic
          ? "Grand Ballroom Menara 165"
          : venueName,
        address,
        mapsUrl: isWedding3D || isRakaAyu
          ? "https://maps.google.com/?q=Jakarta"
          : "https://maps.google.com/?q=Menara+165+Jakarta",
      },
    ],
    galleries: isWedding3D
      ? [
          {
            id: "gal-1",
            imageUrl: "/templates/wedding-3d/cover.jpg",
            caption: "Cinta Dalam Keheningan Bintang",
            sortOrder: 0,
          },
          {
            id: "gal-2",
            imageUrl: "/templates/wedding-3d/bride.jpg",
            caption: "Pesona Anggun Sang Pengantin Wanita",
            sortOrder: 1,
          },
          {
            id: "gal-3",
            imageUrl: "/templates/wedding-3d/groom.jpg",
            caption: "Wibawa & Ketulusan Hati Sang Pria",
            sortOrder: 2,
          },
          {
            id: "gal-4",
            imageUrl: "/templates/wedding-3d/desktop-cover.jpg",
            caption: "Ikrar Janji Suci Selamanya",
            sortOrder: 3,
          },
        ]
      : isRakaAyu
      ? [
          {
            id: "gal-1",
            imageUrl: "/templates/raka-ayu/cover.jpg",
            caption: "Kidung Asmara di Lembayung Senja",
            sortOrder: 0,
          },
          {
            id: "gal-2",
            imageUrl: "/templates/raka-ayu/bride.jpg",
            caption: "Pesona Anggun Sang Mempelai Wanita",
            sortOrder: 1,
          },
          {
            id: "gal-3",
            imageUrl: "/templates/raka-ayu/groom.jpg",
            caption: "Wibawa & Keteguhan Hati Sang Pria",
            sortOrder: 2,
          },
          {
            id: "gal-4",
            imageUrl: "/templates/raka-ayu/desktop-cover.jpg",
            caption: "Ikrar Abadi Menuju Mahligai Suci",
            sortOrder: 3,
          },
          {
            id: "gal-5",
            imageUrl: "/templates/botanical/gallery/gallery-2.jpg",
            caption: "Langkah Bersama Menggapai Berkah",
            sortOrder: 4,
          },
          {
            id: "gal-6",
            imageUrl: "/templates/botanical/gallery/gallery-6.jpg",
            caption: "Satu Janji Selamanya",
            sortOrder: 5,
          },
        ]
      : isGothic
      ? [
          {
            id: "gal-1",
            imageUrl: "/templates/gothic/gallery-1.jpg",
            caption: "Editorial Moments in Dark Elegance",
            sortOrder: 0,
          },
          {
            id: "gal-2",
            imageUrl: "/templates/gothic/gallery-2.jpg",
            caption: "The Bride Serenade in Lace",
            sortOrder: 1,
          },
          {
            id: "gal-3",
            imageUrl: "/templates/gothic/gallery-3.jpg",
            caption: "Groom Bespoke Elegance",
            sortOrder: 2,
          },
          {
            id: "gal-4",
            imageUrl: "/templates/gothic/gallery-4.jpg",
            caption: "Architectural Silhouette & Shadows",
            sortOrder: 3,
          },
        ]
      : [
          {
            id: "gal-1",
            imageUrl: "/templates/botanical/gallery/gallery-1.jpg",
            caption: "Ruang Temu & Secangkir Kopi",
            sortOrder: 0,
          },
          {
            id: "gal-2",
            imageUrl: "/templates/botanical/gallery/gallery-2.jpg",
            caption: "Simbol Ikrar Abadi",
            sortOrder: 1,
          },
          {
            id: "gal-3",
            imageUrl: "/templates/botanical/gallery/gallery-3.jpg",
            caption: "Tawa & Bahagia",
            sortOrder: 2,
          },
          {
            id: "gal-4",
            imageUrl: "/templates/botanical/gallery/gallery-4.jpg",
            caption: "Hutan Pinus Cikole",
            sortOrder: 3,
          },
          {
            id: "gal-5",
            imageUrl: "/templates/botanical/gallery/gallery-5.jpg",
            caption: "Merajut Asa & Bertumbuh",
            sortOrder: 4,
          },
          {
            id: "gal-6",
            imageUrl: "/templates/botanical/gallery/gallery-6.jpg",
            caption: "Satu Janji Selamanya",
            sortOrder: 5,
          },
          {
            id: "gal-7",
            imageUrl: "/templates/botanical/gallery/gallery-7.jpg",
            caption: "Keanggunan Sang Mempelai",
            sortOrder: 6,
          },
          {
            id: "gal-8",
            imageUrl: "/templates/botanical/gallery/gallery-8.jpg",
            caption: "Harmoni Langkah Bersama",
            sortOrder: 7,
          },
          {
            id: "gal-9",
            imageUrl: "/templates/botanical/gallery/gallery-9.jpg",
            caption: "Harmoni Alam & Asmara",
            sortOrder: 8,
          },
          {
            id: "gal-10",
            imageUrl: "/templates/botanical/gallery/gallery-10.jpg",
            caption: "Menatap Hari Bahagia",
            sortOrder: 9,
          },
        ],
    bankAccounts: isWedding3D || isRakaAyu
      ? [
          {
            id: "ba-1",
            bankName: "Bank BCA",
            accountNumber: "8820491823",
            accountHolder: "Raka Pratama",
          },
          {
            id: "ba-2",
            bankName: "Bank Mandiri",
            accountNumber: "1370018294821",
            accountHolder: "Ayu Lestari",
          },
        ]
      : isGothic
      ? [
          {
            id: "ba-1",
            bankName: "Bank BCA",
            accountNumber: "123123123",
            accountHolder: "Putri Cantika Sari",
          },
          {
            id: "ba-2",
            bankName: "Bank BRI",
            accountNumber: "321321321",
            accountHolder: "Putra Andika Pratama",
          },
        ]
      : [
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

  const [data, setData] = useState<WeddingInvitationData | null>(() => (slug ? getDemoWeddingData(slug) : null));
  const [loading, setLoading] = useState<boolean>(() => !slug || !getDemoWeddingData(slug));
  const [error, setError] = useState(false);

  // Track live visitor presence via Supabase Realtime
  useVisitorPresence({ slug, guestName });

  useEffect(() => {
    if (!slug) return;

    // Check demo data first
    const demo = getDemoWeddingData(slug);
    if (demo) {
      document.title = `${demo.title} | Invity by Fasaro`;
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
          document.title = `${json.data.title || "Undangan Pernikahan"} | Invity by Fasaro`;
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
