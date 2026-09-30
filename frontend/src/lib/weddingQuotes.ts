export interface WeddingQuoteItem {
  id: string;
  label: string;
  source: string;
  category: "islami" | "hadits" | "formal" | "romantis" | "adat";
  text: string;
}

export const WEDDING_QUOTES: WeddingQuoteItem[] = [
  {
    id: "ar-rum-21",
    label: "QS. Ar-Rum : 21 (Pernikahan Penuh Berkah & Tenteram)",
    source: "QS. Ar-Rum: 21",
    category: "islami",
    text: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir. (QS. Ar-Rum: 21)",
  },
  {
    id: "an-nur-32",
    label: "QS. An-Nur : 32 (Karunia & Janji Kemudahan Rezeki)",
    source: "QS. An-Nur: 32",
    category: "islami",
    text: "Dan nikahkanlah orang-orang yang masih membujang di antara kamu, dan juga orang-orang yang layak (menikah) dari hamba-hamba sahayamu yang laki-laki dan perempuan. Jika mereka miskin, Allah akan memberi kemampuan kepada mereka dengan karunia-Nya. Dan Allah Mahaluas (pemberian-Nya), Maha Mengetahui. (QS. An-Nur: 32)",
  },
  {
    id: "hadits-sunnah",
    label: "Hadits Rasulullah SAW (Keutamaan Sunnah Menikah)",
    source: "HR. Ibnu Majah & Thabrani",
    category: "hadits",
    text: "Menikah adalah sunnahku. Barangsiapa tidak mengamalkan sunnahku, maka ia bukan termasuk golonganku. Menikahlah kalian, karena aku bangga dengan banyaknya umatku di hadapan umat-umat lain pada hari kiamat. (HR. Ibnu Majah)",
  },
  {
    id: "doa-rahmat",
    label: "Doa Rahmat & Ridho Allah SWT (Islami Klasik)",
    source: "Doa & Harapan Mempelai",
    category: "islami",
    text: "Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan syukuran pernikahan kami.",
  },
  {
    id: "formal-elegan",
    label: "Universal & Formal Santun (Keluarga Besar)",
    source: "Undangan Formal Elegan",
    category: "formal",
    text: "Tanpa mengurangi rasa hormat, dengan penuh rasa syukur kami mengundang Bapak/Ibu/Saudara/i sekalian untuk hadir dan memberikan doa restu pada hari bahagia pernikahan kami.",
  },
  {
    id: "romantis-puitis",
    label: "Romantis & Takdir Kasih Abadi",
    source: "Puitis & Kasih Abadi",
    category: "romantis",
    text: "Dua hati, dua perjalanan, bersatu dalam satu ikatan suci pernikahan. Pertemuan yang digariskan takdir kini mengikat janji sehidup semati. Kehadiran serta doa restu Anda adalah pelengkap kebahagiaan kami.",
  },
  {
    id: "adat-nusantara",
    label: "Restu Orang Tua & Adat Budaya Nusantara",
    source: "Adat & Restu Leluhur",
    category: "adat",
    text: "Dengan memohon berkah Tuhan Yang Maha Esa serta restu dari kedua orang tua dan keluarga besar, kami bermaksud melangsungkan janji suci pernikahan untuk melangkah bersama mengarungi bahtera kehidupan.",
  },
];
