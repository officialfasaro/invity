import React from "react";
import { WeddingInvitationData } from "@/types/wedding";
import BotanicalTheme from "./botanical/BotanicalTheme";
import EditorialTheme from "./editorial/EditorialTheme";
import GothicTheme from "./gothic/GothicTheme";
import RakaAyuTheme from "./raka-ayu/RakaAyuTheme";
import Wedding3DTheme from "./wedding-3d/Wedding3DTheme";

interface ThemeRendererProps {
  data: WeddingInvitationData;
  guestName?: string;
  forcedThemeId?: string;
  showCover?: boolean;
  isEmbedded?: boolean;
}

export const ThemeRenderer: React.FC<ThemeRendererProps> = ({
  data,
  guestName,
  forcedThemeId,
  showCover = true,
  isEmbedded = false,
}) => {
  const activeThemeId = (forcedThemeId || data.themeId || "botanical").toLowerCase();

  const renderTheme = () => {
    if (
      activeThemeId === "wedding-3d" ||
      activeThemeId === "wedding-3d-template" ||
      activeThemeId === "three-d" ||
      activeThemeId === "3d" ||
      activeThemeId === "3d tema 01" ||
      activeThemeId === "3d-tema-01" ||
      activeThemeId === "tema-5" ||
      activeThemeId === "tema5"
    ) {
      return (
        <Wedding3DTheme
          data={data}
          guestName={guestName}
          showCover={showCover}
          isEmbedded={isEmbedded}
        />
      );
    }

    if (
      activeThemeId === "raka-ayu" ||
      activeThemeId === "raka-dan-ayu" ||
      activeThemeId === "royal" ||
      activeThemeId === "royal tema 01" ||
      activeThemeId === "royal-tema-01" ||
      activeThemeId === "raka" ||
      activeThemeId === "tema-4" ||
      activeThemeId === "tema4" ||
      activeThemeId === "emerald"
    ) {
      return (
        <RakaAyuTheme
          data={data}
          guestName={guestName}
          showCover={showCover}
          isEmbedded={isEmbedded}
        />
      );
    }

    if (
      activeThemeId === "gothic" ||
      activeThemeId === "gothic tema 01" ||
      activeThemeId === "gothic-tema-01" ||
      activeThemeId === "invisimple-l08" ||
      activeThemeId === "invisimple" ||
      activeThemeId === "vintage-gothic" ||
      activeThemeId === "dark-gothic" ||
      activeThemeId === "l08" ||
      activeThemeId === "tema-3" ||
      activeThemeId === "tema3" ||
      activeThemeId === "stitch_editorial_luxury_wedding_invitation v2" ||
      activeThemeId === "stitch_editorial_luxury_wedding_invitation_v2"
    ) {
      return (
        <GothicTheme
          data={data}
          guestName={guestName}
          showCover={showCover}
          isEmbedded={isEmbedded}
        />
      );
    }

    if (
      activeThemeId === "editorial" ||
      activeThemeId === "editorial tema 01" ||
      activeThemeId === "editorial-tema-01" ||
      activeThemeId === "stitch_editorial" ||
      activeThemeId === "stitch-editorial" ||
      activeThemeId === "stitch_editorial_luxury" ||
      activeThemeId === "stitch_editorial_luxury_wedding_invitation" ||
      activeThemeId === "tema-2" ||
      activeThemeId === "tema2"
    ) {
      return (
        <EditorialTheme
          data={data}
          guestName={guestName}
          showCover={showCover}
          isEmbedded={isEmbedded}
        />
      );
    }

    return (
      <BotanicalTheme
        data={data}
        guestName={guestName}
        showCover={showCover}
        isEmbedded={isEmbedded}
      />
    );
  };

  return (
    <div className="theme-invitation theme-wrapper no-scrollbar w-full min-h-screen">
      {renderTheme()}
    </div>
  );
};

export default ThemeRenderer;

