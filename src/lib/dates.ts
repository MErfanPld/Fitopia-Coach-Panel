/** تقویم شمسی کامل — تبدیل و فرمت فارسی */

const FA = "۰۱۲۳۴۵۶۷۸۹";
export const toFaDigits = (s: string | number) =>
  String(s).replace(/\d/g, (d) => FA[Number(d)]);

export const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
] as const;

export const PERSIAN_WEEKDAYS = [
  "شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه",
] as const;

/** Gregorian → Jalali */
export function toJalali(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number } {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

/** Jalali → Gregorian */
export function toGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  let gy = jy <= 979 ? 621 : 1600;
  jy -= jy <= 979 ? 0 : 979;
  const days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * Math.floor(days / 146097);
  let d = days % 146097;
  if (d > 36524) {
    gy += 100 * Math.floor(--d / 36524);
    d %= 36524;
    if (d >= 365) d++;
  }
  gy += 4 * Math.floor(d / 1461);
  d %= 1461;
  if (d > 365) {
    gy += Math.floor((d - 1) / 365);
    d = (d - 1) % 365;
  }
  const gd = d + 1;
  const sal_a = [
    0, 31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
  ];
  let gm = 0;
  let v = gd;
  for (gm = 1; gm <= 12 && v > sal_a[gm]; gm++) v -= sal_a[gm];
  return { gy, gm, gd: v };
}

export function jalaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  // leap?
  const a = jy - (jy > 0 ? 474 : 473);
  const b = 474 + (a % 2820);
  const leap = ((b + 38) * 682) % 2816 < 682;
  return leap ? 30 : 29;
}

/** ISO yyyy-mm-dd → {jy,jm,jd} */
export function isoToJalali(iso?: string | null): { jy: number; jm: number; jd: number } | null {
  if (!iso) return null;
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }
  return toJalali(Number(m[1]), Number(m[2]), Number(m[3]));
}

/** {jy,jm,jd} → ISO yyyy-mm-dd */
export function jalaliToIso(jy: number, jm: number, jd: number): string {
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayJalali() {
  const d = new Date();
  return toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function formatFaDate(
  value?: string | Date | null,
  opts?: { withTime?: boolean; short?: boolean },
): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) {
    const j = isoToJalali(String(value));
    if (!j) return String(value);
    const month = opts?.short ? PERSIAN_MONTHS[j.jm - 1].slice(0, 3) : PERSIAN_MONTHS[j.jm - 1];
    return toFaDigits(`${j.jd} ${month} ${j.jy}`);
  }
  const j = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const month = opts?.short ? PERSIAN_MONTHS[j.jm - 1] : PERSIAN_MONTHS[j.jm - 1];
  let out = `${j.jd} ${month} ${j.jy}`;
  if (opts?.withTime) {
    const h = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    out += `، ${h}:${mi}`;
  }
  return toFaDigits(out);
}

export function formatFaDateTime(value?: string | Date | null): string {
  return formatFaDate(value, { withTime: true, short: true });
}

export function formatFaMonthYear(date = new Date()): string {
  const j = toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return toFaDigits(`${PERSIAN_MONTHS[j.jm - 1]} ${j.jy}`);
}

export function formatFaWeekday(date = new Date()): string {
  const j = toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  // JS: 0=Sun … convert to Persian week starting Sat
  const wd = (date.getDay() + 1) % 7; // Sat=0
  return toFaDigits(`${PERSIAN_WEEKDAYS[wd]} ${j.jd} ${PERSIAN_MONTHS[j.jm - 1]}`);
}

/** نمایش سال/ماه شمسی از سال میلادی API */
export function formatFaYearMonth(year: number, month: number): string {
  // approximate: mid-month Gregorian → Jalali label
  const j = toJalali(year, month, 15);
  return toFaDigits(`${PERSIAN_MONTHS[j.jm - 1]} ${j.jy}`);
}
