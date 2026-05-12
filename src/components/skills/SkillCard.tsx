import type { ComponentPropsWithoutRef } from "react";
import cn from "@/utils/cn";

export type SkillCardGroup = {
  title?: string;
  skills: readonly string[];
};

type SkillCardTone = "amber" | "teal" | "slate";

type SkillCardProps = ComponentPropsWithoutRef<"article"> & {
  title: string;
  description: string;
  groups: readonly SkillCardGroup[];
  tone?: SkillCardTone;
};

const cardClasses =
  "relative flex h-full flex-col overflow-hidden rounded-4xl border border-[color-mix(in_oklab,var(--foreground)_12%,transparent)] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_76%,transparent)_0%,color-mix(in_oklab,var(--background)_92%,transparent)_100%)] p-6 shadow-[0_28px_80px_color-mix(in_oklab,var(--background)_76%,transparent)] [-webkit-backdrop-filter:blur(24px)] backdrop-blur-[24px] before:pointer-events-none before:absolute before:-right-10 before:-top-20 before:h-56 before:w-56 before:rounded-full before:bg-[var(--skills-card-accent)] before:opacity-95 before:blur-[42px] before:content-[''] after:pointer-events-none after:absolute after:inset-px after:rounded-[inherit] after:bg-[linear-gradient(135deg,color-mix(in_oklab,var(--foreground)_8%,transparent)_0%,transparent_34%),linear-gradient(180deg,transparent_58%,color-mix(in_oklab,var(--foreground)_5%,transparent)_100%)] after:opacity-70 after:content-[''] sm:p-8";

const gridClasses =
  "pointer-events-none absolute inset-0 rounded-[inherit] opacity-35 [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_6%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_6%,transparent)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.65),transparent_72%)]";

const chipClasses =
  "inline-flex rounded-full border border-[color-mix(in_oklab,var(--foreground)_10%,transparent)] bg-[color-mix(in_oklab,var(--background)_78%,transparent)] px-3 py-1.5 text-sm font-medium text-foreground shadow-[inset_0_1px_0_color-mix(in_oklab,var(--foreground)_8%,transparent)]";

const toneClasses: Record<SkillCardTone, string> = {
  amber:
    "[--skills-card-accent:color-mix(in_oklab,var(--hero-two)_66%,transparent)]",
  teal: "[--skills-card-accent:color-mix(in_oklab,var(--hero-three)_68%,transparent)]",
  slate:
    "[--skills-card-accent:color-mix(in_oklab,var(--hero-four)_66%,transparent)]",
};

function SkillCard({
  className,
  title,
  description,
  groups,
  tone = "amber",
  ...props
}: SkillCardProps) {
  return (
    <article
      {...props}
      className={cn(cardClasses, toneClasses[tone], className)}
    >
      <div className={gridClasses} />

      <div className="relative z-10 flex h-full flex-col">
        <h3 className="max-w-xs text-2xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
          {title}
        </h3>
        <p className="text-foreground-muted mt-4 max-w-sm text-sm leading-6 sm:text-base">
          {description}
        </p>

        <div className="mt-8 space-y-6">
          {groups.map((group, index) => (
            <div key={group.title ?? `${title}-${index}`}>
              {group.title ? (
                <p className="text-foreground-soft text-xs font-semibold uppercase tracking-[0.24em]">
                  {group.title}
                </p>
              ) : null}

              <ul className="mt-3 flex flex-wrap gap-2.5">
                {group.skills.map((skill) => (
                  <li key={skill}>
                    <span className={chipClasses}>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default SkillCard;
