export type ClassValue = string | number | boolean | undefined | null | ClassValue[];

function toVal(val: ClassValue): string {
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) return val.map(toVal).filter(Boolean).join(" ");
  return "";
}

export function cn(...inputs: ClassValue[]) {
  return inputs.map(toVal).filter(Boolean).join(" ");
}
