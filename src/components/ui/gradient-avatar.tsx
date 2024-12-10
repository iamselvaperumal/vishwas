import clsx from "clsx";
import { CSSProperties, FC } from "react";

export type GradientAvatarProps = {
  text: string;
  className?: string;
  style?: CSSProperties;
  maxInitials?: number;
  showInitials?: boolean;
};

function hashStringToInt(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function intToRGB(i: number) {
  const r = (i >> 16) & 255;
  const g = (i >> 8) & 255;
  const b = i & 255;
  return `rgb(${r},${g},${b})`;
}

function generateGradient(text: string) {
  const hash1 = hashStringToInt(text);
  const hash2 = hashStringToInt(text.split("").reverse().join(""));

  const color1 = intToRGB(hash1);
  const color2 = intToRGB(hash2);

  return `linear-gradient(135deg, ${color1}, ${color2})`;
}

export const GradientAvatar: FC<GradientAvatarProps> = ({
  className,
  style,
  text,
  maxInitials = 2,
  showInitials = true,
}) => {
  const gradient = generateGradient(text);

  const initials = showInitials
    ? text
        .split(" ")
        .map((word) => word[0])
        .slice(0, maxInitials)
        .join("")
        .toUpperCase()
    : "";

  return (
    <div
      className={clsx(
        "flex items-center justify-center w-12 h-12 rounded-full  font-semibold font-sans",
        className
      )}
      style={{ background: gradient, ...style }}
    >
      {initials}
    </div>
  );
};
