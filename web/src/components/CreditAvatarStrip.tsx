"use client";

import { useCallback, useState } from "react";
import { personPhotoUrl, type CreditPerson } from "@/lib/api";

function nameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const a = parts[0][0];
  const b = parts[parts.length - 1][0];
  return `${a}${b}`.toUpperCase();
}

function CreditAvatar({ person }: { person: CreditPerson }) {
  const [broken, setBroken] = useState(false);
  const showPhoto = person.photoAvailable && !broken;
  const onErr = useCallback(() => setBroken(true), []);

  return (
    <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full bg-imdb-panel ring-2 ring-imdb-border">
      {showPhoto ? (
        <img
          src={personPhotoUrl(person.tmdbPersonId)}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          onError={onErr}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center px-1 text-center text-[12px] font-bold leading-none text-imdb-muted">
          {nameInitials(person.name)}
        </span>
      )}
    </div>
  );
}

export function CreditAvatarStrip({
  title,
  people,
  showCharacter,
}: {
  title: string;
  people: CreditPerson[];
  /** Character / role line under name (cast only). */
  showCharacter?: boolean;
}) {
  if (!people.length) return null;
  return (
    <section className="mt-6">
      <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-imdb-dim">{title}</h3>
      <ul className="flex flex-wrap gap-x-5 gap-y-6">
        {people.map((p) => (
          <li key={`${p.tmdbPersonId}-${p.name}`} className="flex w-[92px] flex-col items-center text-center">
            <CreditAvatar person={p} />
            <span className="mt-2 line-clamp-3 text-[11px] font-medium leading-tight text-imdb-text">{p.name}</span>
            {showCharacter && p.character ? (
              <span className="line-clamp-2 text-[10px] leading-tight text-imdb-muted">{p.character}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
