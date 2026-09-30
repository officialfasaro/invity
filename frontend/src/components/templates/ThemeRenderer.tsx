"use client";

import React from "react";
import { WeddingInvitationData } from "@/types/wedding";
import MinimalistTheme from "./minimalist/MinimalistTheme";
import RusticTheme from "./rustic/RusticTheme";
import SyariTheme from "./syari/SyariTheme";
import RoyalTheme from "./royal/RoyalTheme";
import AdiRaraTheme from "./adirara/AdiRaraTheme";
import MinangTheme from "./minang/MinangTheme";
import BotanicalTheme from "./botanical/BotanicalTheme";
import VelvetTheme from "./velvet/VelvetTheme";
import PublicInvitationLayout from "./shared/PublicInvitationLayout";

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
  const activeTheme = forcedThemeId || data.themeId;

  const renderThemeContent = () => {
    switch (activeTheme) {
      case "velvet":
        return (
          <VelvetTheme
            data={data}
            guestName={guestName}
            showCover={showCover}
            isEmbedded={isEmbedded}
          />
        );
      case "botanical":
        return (
          <BotanicalTheme
            data={data}
            guestName={guestName}
            showCover={showCover}
            isEmbedded={isEmbedded}
          />
        );
      case "minang":
        return (
          <MinangTheme
            data={data}
            guestName={guestName}
            showCover={showCover}
            isEmbedded={isEmbedded}
          />
        );
      case "adirara":
        return (
          <AdiRaraTheme
            data={data}
            guestName={guestName}
            showCover={showCover}
            isEmbedded={isEmbedded}
          />
        );
      case "royal":
        return (
          <RoyalTheme
            data={data}
            guestName={guestName}
            showCover={showCover}
            isEmbedded={isEmbedded}
          />
        );
      case "rustic":
        return (
          <RusticTheme
            data={data}
            guestName={guestName}
            showCover={showCover}
            isEmbedded={isEmbedded}
          />
        );
      case "syari":
        return (
          <SyariTheme
            data={data}
            guestName={guestName}
            showCover={showCover}
            isEmbedded={isEmbedded}
          />
        );
      case "minimalist":
      default:
        return (
          <MinimalistTheme
            data={data}
            guestName={guestName}
            showCover={showCover}
            isEmbedded={isEmbedded}
          />
        );
    }
  };

  // If inside mobile simulation frame (device mock), render directly
  if (isEmbedded) {
    return renderThemeContent();
  }

  // Public web view: render with Desktop Split Layout and Mobile Bottom Nav
  return (
    <PublicInvitationLayout data={data} guestName={guestName}>
      {renderThemeContent()}
    </PublicInvitationLayout>
  );
};

export default ThemeRenderer;
