import { TOKEN_STORAGE_KEY, REFRESH_STORAGE_KEY, USER_STORAGE_KEY } from './constants';


const COOKIE_DAYS = 7;

const setCookie = (name, value) => {
  const expires = new Date(Date.now() + COOKIE_DAYS * 24 * 60 * 60 * 1000).toUTCString();
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
};

const getCookie = (name) => {
  const row = document.cookie.split('; ').find((item) => item.startsWith(`${name}=`));
  return row ? decodeURIComponent(row.slice(name.length + 1)) : null;
};

const removeCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
};


const toSessionUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  profileImage: user.profileImage,
  status: user.status,
  isApproved: user.isApproved,
  approvalStatus: user.approvalStatus,
});

export const storage = {
  getAccessToken: () => getCookie(TOKEN_STORAGE_KEY),
  getRefreshToken: () => getCookie(REFRESH_STORAGE_KEY),
  getUser: () => {
    const raw = getCookie(USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setSession: ({ accessToken, refreshToken, user }) => {
    if (accessToken) setCookie(TOKEN_STORAGE_KEY, accessToken);
    if (refreshToken) setCookie(REFRESH_STORAGE_KEY, refreshToken);
    if (user) setCookie(USER_STORAGE_KEY, JSON.stringify(toSessionUser(user)));
  },
  setAccessToken: (token) => setCookie(TOKEN_STORAGE_KEY, token),
  clear: () => {
    removeCookie(TOKEN_STORAGE_KEY);
    removeCookie(REFRESH_STORAGE_KEY);
    removeCookie(USER_STORAGE_KEY);
  },
};
