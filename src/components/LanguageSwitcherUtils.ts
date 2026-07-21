type SearchQuery = Record<string, string | string[]>;

export function normalizeHashFragment(hash: string): string | null {
  return hash === "" || hash === "#" ? null : hash;
}

export function getQueryFromSearch(search: string): SearchQuery | undefined {
  const searchParams = new URLSearchParams(search);

  if (searchParams.size === 0) {
    return undefined;
  }

  const query = Object.create(null) as SearchQuery;

  searchParams.forEach((value, key) => {
    const existingValue = query[key];

    if (existingValue === undefined) {
      query[key] = value;
      return;
    }

    if (Array.isArray(existingValue)) {
      existingValue.push(value);
      return;
    }

    query[key] = [existingValue, value];
  });

  return query;
}

export function getLocaleSwitchHref<TPathname extends string>(
  pathname: TPathname,
  search: string,
) {
  const query = getQueryFromSearch(search);

  return query === undefined ? { pathname } : { pathname, query };
}

type PendingLocaleSwitchHash = {
  hash: string;
  targetLocale: string;
};

// Module scope on purpose: a locale switch changes the [locale] segment
// param, which remounts the whole segment subtree — including the
// LanguageSwitcher that initiated the switch — so component state (refs
// included) cannot carry the hash across the navigation.
let pendingLocaleSwitchHash: PendingLocaleSwitchHash | null = null;

export function setPendingLocaleSwitchHash(
  hash: string | null,
  targetLocale: string,
): void {
  pendingLocaleSwitchHash = hash === null ? null : { hash, targetLocale };
}

/**
 * Returns the pending hash once the switch has landed on its target locale
 * and clears it, so it is consumed exactly once. Returns null while the
 * navigation is still in flight or when nothing is pending.
 */
export function consumePendingLocaleSwitchHash(
  currentLocale: string,
): string | null {
  if (
    pendingLocaleSwitchHash === null ||
    pendingLocaleSwitchHash.targetLocale !== currentLocale
  ) {
    return null;
  }

  const { hash } = pendingLocaleSwitchHash;

  pendingLocaleSwitchHash = null;

  return hash;
}
