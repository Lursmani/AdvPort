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
