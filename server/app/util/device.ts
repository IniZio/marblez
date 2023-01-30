import _isMobile from "ismobilejs"

export const isMobile = _isMobile(typeof window !== "undefined" ? window.navigator : undefined)
