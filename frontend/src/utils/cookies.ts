/**
 * Cookie management utilities for Access and Refresh tokens.
 * Ensures cookies are properly registered and visible in Chrome DevTools (Application > Cookies).
 */

export function setCookie(name: string, value: string, maxAgeSeconds: number = 86400, path: string = '/'): void {
  try {
    const isSecure = window.location.protocol === 'https:';
    let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}; max-age=${maxAgeSeconds}; SameSite=Lax`;
    if (isSecure) {
      cookieStr += '; Secure';
    }
    document.cookie = cookieStr;
  } catch (e) {
    console.error('Failed to set cookie', name, e);
  }
}

export function getCookie(name: string): string | null {
  try {
    const nameEQ = encodeURIComponent(name) + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
  } catch (e) {
    console.error('Failed to get cookie', name, e);
  }
  return null;
}

export function deleteCookie(name: string, path: string = '/'): void {
  try {
    document.cookie = `${encodeURIComponent(name)}=; path=${path}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  } catch (e) {
    console.error('Failed to delete cookie', name, e);
  }
}
