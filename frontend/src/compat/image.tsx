import React from "react";

export interface NextImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | `${number}`;
  height?: number | `${number}`;
  fill?: boolean;
  priority?: boolean;
  quality?: number | `${number}`;
  loading?: "eager" | "lazy";
  unoptimized?: boolean;
}

export default function Image({
  src,
  alt,
  width,
  height,
  fill,
  priority,
  className = "",
  style,
  ...props
}: NextImageProps) {
  const combinedClassName = fill
    ? `absolute inset-0 w-full h-full object-cover ${className}`.trim()
    : className;

  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(fill
      ? {
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          width: "100%",
          height: "100%",
        }
      : {}),
  };

  return (
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? "eager" : "lazy"}
      className={combinedClassName}
      style={combinedStyle}
      {...props}
    />
  );
}
