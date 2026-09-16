/**
 * Base-path–aware URL helpers.
 *
 * Every internal href must go through `url()` so the site works unchanged
 * whether it is served from a user site (base `/`), a project repo
 * (base `/repo-name`) or a custom domain.
 */

const BASE = import.meta.env.BASE_URL;

/**
 * True for paths that should carry a trailing slash. Pages do (the build emits
 * `about/index.html`, which is served as `/about/`, and that is what canonicals
 * and the sitemap advertise). Files do not — `/favicon.svg/` would 404.
 */
function isPagePath(path: string): boolean {
  if (path === '/' || path.endsWith('/')) return false;
  if (path.includes('#') || path.includes('?')) return false;
  const last = path.split('/').pop() ?? '';
  return !last.includes('.');
}

/**
 * Resolve an app-relative path (e.g. `/builds`) against the configured base.
 *
 * Page paths come back with a trailing slash so that every internal link
 * matches the page's own canonical URL and costs no redirect.
 */
export function url(path = '/'): string {
  const base = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  const withSlash = isPagePath(suffix) ? `${suffix}/` : suffix;
  const resolved = `${base}${withSlash}`;
  return resolved === '' ? '/' : resolved;
}

/** Absolute URL, for canonicals, Open Graph and feeds. */
export function absoluteUrl(path: string, origin: string | URL | undefined): string {
  if (!origin) return url(path);
  return new URL(url(path), origin).toString();
}

/** True when `path` is exactly the current page. Use for `aria-current="page"`. */
export function isExact(path: string, current: string): boolean {
  return url(path).replace(/\/$/, '') === current.replace(/\/$/, '');
}

/** True when `path` is the current page (or an ancestor section of it). */
export function isActive(path: string, current: string): boolean {
  const target = url(path).replace(/\/$/, '');
  const here = current.replace(/\/$/, '');
  if (target === url('/').replace(/\/$/, '')) return here === target;
  return here === target || here.startsWith(`${target}/`);
}

/**
 * Strip the deploy base from a real request pathname.
 *
 * `Astro.url.pathname` already includes the configured base, while `url()`
 * prepends it — so passing a pathname straight into `url()`/`absoluteUrl()`
 * yields `/base/base/page`. Always run request pathnames through this first.
 * Invisible while the base is `/`; wrong the moment it is not.
 */
export function appPath(pathname: string): string {
  const base = BASE.replace(/\/$/, '');
  if (base && pathname.startsWith(base)) {
    return pathname.slice(base.length) || '/';
  }
  return pathname;
}

/** Canonical absolute URL for the page currently being rendered. */
export function canonicalUrl(pathname: string, origin: string | URL | undefined): string {
  return absoluteUrl(appPath(pathname), origin);
}
