import cn from "@/utils/cn";
import {
  getExperienceToneStyle,
  type ExperiencePattern,
  type ExperienceTone,
} from "./experience-data";
import styles from "./ExperienceSection.module.css";

type ExperienceArtworkProps = {
  title: string;
  timeline: string;
  tone: ExperienceTone;
  pattern: ExperiencePattern;
  slideIndex: number;
  className?: string;
};

const surfaceStyle = {
  borderColor: "color-mix(in oklab, var(--foreground) 14%, transparent)",
  background:
    "linear-gradient(180deg, color-mix(in oklab, var(--experience-accent) 18%, transparent) 0%, color-mix(in oklab, var(--background) 88%, transparent) 100%)",
};

const fillStyle = {
  background:
    "linear-gradient(180deg, color-mix(in oklab, var(--experience-accent-strong) 62%, transparent) 0%, color-mix(in oklab, var(--experience-accent) 24%, transparent) 100%)",
};

const mutedStyle = {
  background: "color-mix(in oklab, var(--foreground) 10%, transparent)",
};

const accentStyle = {
  background:
    "color-mix(in oklab, var(--experience-accent-strong) 82%, transparent)",
};

type SurfaceProps = {
  className?: string;
  children?: React.ReactNode;
};

function Surface({ className, children }: SurfaceProps) {
  return (
    <div
      className={cn("rounded-[1.15rem] border", className)}
      style={surfaceStyle}
    >
      {children}
    </div>
  );
}

function renderPattern(pattern: ExperiencePattern) {
  switch (pattern) {
    case "dashboard":
      return (
        <div className="grid h-full grid-cols-[1.25fr_0.85fr] gap-3">
          <Surface className="flex flex-col justify-between p-4">
            <div className="space-y-3">
              <div className="h-3 w-24 rounded-full" style={mutedStyle} />
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="rounded-2xl p-3"
                    style={{ ...fillStyle, opacity: 0.7 + index * 0.08 }}
                  >
                    <div className="h-2 w-8 rounded-full" style={mutedStyle} />
                    <div className="mt-3 h-9 rounded-2xl" style={mutedStyle} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex h-20 items-end gap-2">
              {[34, 58, 48, 76].map((height, index) => (
                <div
                  key={height}
                  className="flex-1 rounded-t-2xl"
                  style={{
                    ...fillStyle,
                    height: `${height}%`,
                    opacity: 0.5 + index * 0.12,
                  }}
                />
              ))}
            </div>
          </Surface>

          <div className="grid gap-3">
            <Surface className="p-3">
              <div className="flex h-full items-end gap-2">
                {[40, 66, 52].map((height, index) => (
                  <div
                    key={height}
                    className="flex-1 rounded-t-2xl"
                    style={{
                      ...fillStyle,
                      height: `${height}%`,
                      opacity: 0.54 + index * 0.12,
                    }}
                  />
                ))}
              </div>
            </Surface>
            <Surface className="space-y-2 p-3">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="rounded-full px-3 py-2"
                  style={mutedStyle}
                />
              ))}
            </Surface>
          </div>
        </div>
      );
    case "workflow":
      return (
        <div className="grid h-full gap-3">
          {[0, 1, 2].map((index) => (
            <Surface key={index} className="flex items-center gap-3 p-3">
              <div
                className="flex size-10 items-center justify-center rounded-full text-xs font-semibold text-background"
                style={accentStyle}
              >
                0{index + 1}
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded-full" style={mutedStyle} />
                <div className="h-9 rounded-2xl" style={fillStyle} />
              </div>
            </Surface>
          ))}
          <Surface className="grid grid-cols-3 gap-2 p-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="rounded-2xl p-3" style={fillStyle}>
                <div className="h-12 rounded-2xl" style={mutedStyle} />
                <div
                  className="mt-3 h-2 w-12 rounded-full"
                  style={mutedStyle}
                />
              </div>
            ))}
          </Surface>
        </div>
      );
    case "mobile":
      return (
        <div className="grid h-full grid-cols-2 gap-3">
          {[0, 1].map((index) => (
            <Surface key={index} className="flex flex-col rounded-[1.6rem] p-3">
              <div
                className="mx-auto h-1.5 w-14 rounded-full"
                style={mutedStyle}
              />
              <div
                className="mt-4 flex-1 rounded-[1.2rem] p-3"
                style={fillStyle}
              >
                <div className="h-24 rounded-[1rem]" style={mutedStyle} />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((tileIndex) => (
                    <div
                      key={tileIndex}
                      className="h-10 rounded-2xl"
                      style={mutedStyle}
                    />
                  ))}
                </div>
              </div>
            </Surface>
          ))}
        </div>
      );
    case "metrics":
      return (
        <div className="grid h-full grid-rows-[0.95fr_1.05fr] gap-3">
          <Surface className="grid grid-cols-[1fr_auto] items-center gap-4 p-4">
            <div className="space-y-3">
              <div className="h-3 w-24 rounded-full" style={mutedStyle} />
              <div className="h-12 rounded-[1rem]" style={fillStyle} />
              <div className="flex gap-2">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="h-2 flex-1 rounded-full"
                    style={mutedStyle}
                  />
                ))}
              </div>
            </div>
            <div
              className="grid size-28 place-items-center rounded-full border"
              style={surfaceStyle}
            >
              <div
                className="grid size-18 place-items-center rounded-full border"
                style={fillStyle}
              >
                <div className="size-7 rounded-full" style={mutedStyle} />
              </div>
            </div>
          </Surface>
          <Surface className="grid grid-cols-4 gap-2 p-3">
            {[28, 42, 55, 70].map((height, index) => (
              <div key={height} className="flex items-end">
                <div
                  className="w-full rounded-t-[1rem]"
                  style={{
                    ...fillStyle,
                    height: `${height}%`,
                    opacity: 0.58 + index * 0.1,
                  }}
                />
              </div>
            ))}
          </Surface>
        </div>
      );
    case "library":
      return (
        <div className="grid h-full gap-3">
          <Surface className="grid grid-cols-3 gap-2 p-3">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="space-y-2 rounded-[1rem] p-3"
                style={fillStyle}
              >
                <div className="h-16 rounded-[1rem]" style={mutedStyle} />
                <div className="h-2 w-10 rounded-full" style={mutedStyle} />
                <div className="h-2 w-14 rounded-full" style={mutedStyle} />
              </div>
            ))}
          </Surface>
          <Surface className="flex items-center gap-3 p-3">
            <div className="grid flex-1 gap-2">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="h-9 rounded-2xl px-3 py-2"
                  style={mutedStyle}
                />
              ))}
            </div>
            <div className="w-16 rounded-[1.2rem] p-2" style={fillStyle}>
              <div className="h-18 rounded-[1rem]" style={mutedStyle} />
            </div>
          </Surface>
        </div>
      );
    case "network":
      return (
        <div className="grid h-full place-items-center">
          <Surface className="grid size-full place-items-center p-4">
            <div className="relative aspect-square w-full max-w-[16rem]">
              <div
                className="absolute inset-[18%] rounded-full border"
                style={surfaceStyle}
              />
              <div
                className="absolute inset-[34%] rounded-full border"
                style={surfaceStyle}
              />
              {[
                "left-[8%] top-[46%]",
                "right-[10%] top-[24%]",
                "left-[26%] top-[8%]",
                "right-[18%] bottom-[12%]",
                "left-[16%] bottom-[18%]",
              ].map((position) => (
                <div
                  key={position}
                  className={cn(
                    "absolute size-5 rounded-full border border-[color-mix(in_oklab,var(--foreground)_16%,transparent)]",
                    position,
                  )}
                  style={fillStyle}
                />
              ))}
              <div
                className="absolute inset-[42%] rounded-full"
                style={accentStyle}
              />
            </div>
          </Surface>
        </div>
      );
  }
}

function ExperienceArtwork({
  title,
  timeline,
  tone,
  pattern,
  slideIndex,
  className,
}: ExperienceArtworkProps) {
  return (
    <div
      className={cn(styles.artwork, className)}
      style={getExperienceToneStyle(tone)}
    >
      <div className={styles.artworkBackdrop} />

      <div className="relative z-10 flex h-full flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-foreground-soft">
          <span>{timeline}</span>
          <span>{String(slideIndex).padStart(2, "0")}</span>
        </div>

        <div className="mt-4 flex-1">{renderPattern(pattern)}</div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-foreground-soft">
              Selected build
            </p>
            <p className="mt-2 max-w-[13rem] text-sm font-semibold leading-5 text-foreground sm:text-base">
              {title}
            </p>
          </div>

          <div className="size-11 rounded-full border" style={surfaceStyle} />
        </div>
      </div>
    </div>
  );
}

export default ExperienceArtwork;
