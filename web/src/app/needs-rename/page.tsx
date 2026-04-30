import Link from "next/link";
import { NeedsRenameClient } from "@/components/NeedsRenameClient";
import { IconChevronLeft } from "@/components/icons";
import { getLocale } from "@/lib/i18n/getLocale";
import { getMessages } from "@/lib/i18n/messages";

export default async function NeedsRenamePage() {
  const locale = await getLocale();
  const t = getMessages(locale);

  return (
    <div className="min-h-[70vh] bg-imdb-canvas px-4 py-8 font-imdb md:px-8">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-imdb-muted underline-offset-4 hover:text-imdb-text hover:underline"
        >
          <IconChevronLeft size={18} />
          {t.backToLibrary}
        </Link>
      </div>
      <NeedsRenameClient />
    </div>
  );
}
