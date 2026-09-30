/**
 * Helper untuk merangkai pesan undangan WhatsApp & Sosial Media resmi
 * sesuai standar format undangan pernikahan Indonesia.
 */

export interface WeddingCoupleInfo {
  groomName?: string;
  groomNickname?: string;
  groomFather?: string;
  groomMother?: string;
  brideName?: string;
  brideNickname?: string;
  brideFather?: string;
  brideMother?: string;
}

export interface WeddingScheduleItem {
  eventName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  venueName?: string;
  address?: string;
}

export interface WhatsAppMessageParams {
  guestName?: string;
  invitationUrl: string;
  coupleInfo?: WeddingCoupleInfo;
  schedules?: WeddingScheduleItem[];
  greetingType?: "universal" | "islamic" | "christian";
}

export function generateWhatsAppInvitationText({
  guestName,
  invitationUrl,
  coupleInfo,
  schedules,
  greetingType = "universal",
}: WhatsAppMessageParams): string {
  const gName = coupleInfo?.groomName || "Mempelai Pria";
  const bName = coupleInfo?.brideName || "Mempelai Wanita";
  const gNick = coupleInfo?.groomNickname || coupleInfo?.groomName || "Pria";
  const bNick = coupleInfo?.brideNickname || coupleInfo?.brideName || "Wanita";

  const targetGuestUpper = guestName ? guestName.trim().toUpperCase() : "BAPAK/IBU/SAUDARA/I";
  const targetGuestProper = guestName ? guestName.trim() : "Bapak/Ibu/Saudara/i";

  // Salam pembuka sesuai preferensi
  let openingGreeting = "";
  if (greetingType === "islamic") {
    openingGreeting = `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nDengan memohon rahmat dan ridho Allah SWT, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri hari bahagia pernikahan kami.`;
  } else if (greetingType === "christian") {
    openingGreeting = `Salam Sejahtera Bagi Kita Semua. Tuhan membuat segala sesuatu indah pada waktunya dan mempersatukan kami dalam suatu ikatan pernikahan kudus, semoga Tuhan memberkati dalam mengiringi pernikahan kami.`;
  } else {
    // Universal / Umum
    openingGreeting = `Salam Sejahtera Bagi Kita Semua. Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri hari bahagia pernikahan kami.`;
  }

  // Rincian Jadwal Acara
  let scheduleBlock = "";
  const primarySchedule = schedules && schedules.length > 0 ? schedules[0] : null;

  if (primarySchedule && (primarySchedule.date || primarySchedule.venueName)) {
    let dateFormatted = "";
    if (primarySchedule.date) {
      const d = new Date(primarySchedule.date);
      dateFormatted = !isNaN(d.getTime())
        ? d.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : primarySchedule.date;
    }

    const timeFormatted = primarySchedule.startTime
      ? primarySchedule.endTime
        ? `${primarySchedule.startTime} sd ${primarySchedule.endTime} WIB`
        : `${primarySchedule.startTime} WIB sd Selesai`
      : "";

    const eventTitle = primarySchedule.eventName || "Resepsi Pernikahan";
    const venue = primarySchedule.venueName ? `📍 ${primarySchedule.venueName}` : "";
    const address = primarySchedule.address ? `\n${primarySchedule.address}` : "";

    const scheduleLines = ["Acara akan dilaksanakan pada :"];
    if (dateFormatted) scheduleLines.push(`🗓️ ${dateFormatted}`);
    scheduleLines.push("");
    scheduleLines.push(eventTitle);
    if (timeFormatted) scheduleLines.push(`🕐 ${timeFormatted}`);
    if (venue) scheduleLines.push(`${venue}${address}`);

    scheduleBlock = scheduleLines.join("\n");
  }

  // Keluarga Orang Tua
  const groomFamily = [coupleInfo?.groomFather, coupleInfo?.groomMother]
    .filter(Boolean)
    .join(" & ");
  const brideFamily = [coupleInfo?.brideFather, coupleInfo?.brideMother]
    .filter(Boolean)
    .join(" & ");

  let familyLine = "";
  if (groomFamily || brideFamily) {
    const families = [];
    if (groomFamily) families.push(`Kel. ${groomFamily}`);
    if (brideFamily) families.push(`Kel. ${brideFamily}`);
    familyLine = `\n${families.join(" & ")}`;
  }

  // Susun teks pesan lengkap
  return `Kepada Yth.
Bapak/Ibu/Saudara/i
*${targetGuestUpper}*

${openingGreeting}

*${gName}*
&
*${bName}*

${scheduleBlock ? `${scheduleBlock}\n\n` : ""}Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i *${targetGuestProper}*, untuk menghadiri acara kami.

Berikut link undangan kami:

${invitationUrl}

Kami memohon maaf yang sebesar-besarnya atas keterbatasan jarak dan waktu, sehingga undangan ini hanya dapat dibagikan melalui pesan ini.

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu pada acara pernikahan kami.

Semoga kita semua diberikan kesehatan dan tetap dibawah lindungan-Nya.

Atas perhatian Bapak/Ibu/Saudara/i, kami sampaikan Terima kasih.

Hormat Kami,
*${gNick} & ${bNick}*${familyLine}`;
}
