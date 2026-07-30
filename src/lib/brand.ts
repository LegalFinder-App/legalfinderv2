export const IMG = {
  logo: "/__l5e/assets-v1/98dfbf44-dd73-4a52-83c8-3ed1b8be0fad/logo.png",
  logoMark: "/__l5e/assets-v1/7fec1056-f41a-4eac-a8e2-fe0d017a552f/logo-mark.png",
  hero: "/__l5e/assets-v1/be4fa1b7-717f-4476-83a2-7df1f1ac2517/hero-bg.jpg",
  advices: "/__l5e/assets-v1/62125461-9627-4e91-9cfc-dd55a7bede83/advices.jpg",
  books: "/__l5e/assets-v1/9dbe5bf2-f3b1-4abd-b535-6273e3a1e0b2/books.png",
  court: "/__l5e/assets-v1/88b0d526-9a03-41de-896a-a7e823b068c1/court.jpg",
  gavel: "/__l5e/assets-v1/4fe8463e-380b-4a85-a376-9552f7ee2dbb/gavel.png",
  justice: "/__l5e/assets-v1/d6d429fb-136e-4729-a37b-32e03c4be1d5/justice.jpg",
  lawyer: "/__l5e/assets-v1/3d04b738-08a7-4482-a535-f827fe652427/lawyer.png",
  library: "/__l5e/assets-v1/65837f71-8446-47b6-98aa-f5fbc37438ae/library.jpg",
  police: "/__l5e/assets-v1/97676d6f-200f-426c-849e-edb2e8503583/police.jpg",
  tribunal: "/__l5e/assets-v1/4d407cd0-e098-4cf8-8c57-4e1b2c6a1025/tribunal.png",
} as const;

export const ROLE_LABEL: Record<string, string> = {
  user: "Citizen",
  lawyer: "Advocate",
  police: "Law enforcement",
  judiciary: "Judiciary",
  admin: "Administrator",
};

export function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "LF"
  );
}

export function formatMoney(amount: number, currency = "UGX") {
  return `${currency} ${Number(amount).toLocaleString("en-UG")}`;
}
