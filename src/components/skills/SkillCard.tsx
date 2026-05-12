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

const toneClasses: Record<SkillCardTone, string> = {
  amber: "skills-card--amber",
  teal: "skills-card--teal",
  slate: "skills-card--slate",
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
      className={cn(
        "skills-card relative flex h-full flex-col overflow-hidden rounded-[2rem] p-6 sm:p-8",
        toneClasses[tone],
        className,
      )}
    >
      <div className="skills-card-grid pointer-events-none absolute inset-0 rounded-[inherit]" />

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
                    <span className="skills-chip inline-flex rounded-full px-3 py-1.5 text-sm font-medium text-foreground">
                      {skill}
                    </span>
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
