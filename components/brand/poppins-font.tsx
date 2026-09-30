const latin = "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const latinExt = "U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF";

function face(weight: number, style: "normal" | "italic", subset: "latin" | "latin-ext", range: string) {
  return `@font-face { font-family: "Poppins"; font-style: ${style}; font-weight: ${weight}; font-display: swap; src: url("/fonts/poppins-${subset}-${weight}-${style}.woff2") format("woff2"); unicode-range: ${range}; }`;
}

const weights = [400, 500, 600, 700] as const;
const styles = ["normal", "italic"] as const;

const poppinsCss = [
  ...weights.flatMap((weight) => styles.flatMap((style) => [face(weight, style, "latin-ext", latinExt), face(weight, style, "latin", latin)])),
  `html, body, button, input, textarea, select, pre, code { font-family: "Poppins", sans-serif; }`
].join("\n");

export function PoppinsFont() {
  return <style>{poppinsCss}</style>;
}
