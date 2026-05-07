import { defaultLocale } from "@/i18n/config";
import { redirect } from "@/i18n/navigation";

export default function Page() {
  redirect({ href: "/", locale: defaultLocale });
}
