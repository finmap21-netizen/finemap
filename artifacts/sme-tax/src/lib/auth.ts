export const getToken = () => localStorage.getItem('auth_token');
export const setToken = (t: string) => localStorage.setItem('auth_token', t);
export const removeToken = () => localStorage.removeItem('auth_token');
export const isAuthenticated = () => !!getToken();
