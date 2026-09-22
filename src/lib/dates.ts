/** تاریخ و زمان به تقویم شمسی فارسی */

const faNum = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

export function formatFaDate(
  value?: string | Date | null,
  opts?: { withTime?: boolean; short?: boolean },
): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  try {
    if (opts?.withTime) {
      return d.toLocaleString("fa-IR", {
        calendar: "persian",
        year: "numeric",
        month: opts.short ? "short" : "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString("fa-IR", {
      calendar: "persian",
      year: "numeric",
      month: opts?.short ? "short" : "long",
      day: "numeric",
    });
  } catch {
    return d.toLocaleDateString("fa-IR");
  }
}

export function formatFaDateTime(value?: string | Date | null): string {
  return formatFaDate(value, { withTime: true, short: true });
}

export function formatFaMonthYear(date = new Date()): string {
  try {
    return date.toLocaleDateString("fa-IR", {
      calendar: "persian",
      year: "numeric",
      month: "long",
    });
  } catch {
    return date.toLocaleDateString("fa-IR", { year: "numeric", month: "long" });
  }
}

export function formatFaWeekday(date = new Date()): string {
  try {
    return date.toLocaleDateString("fa-IR", {
      calendar: "persian",
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    return date.toLocaleDateString("fa-IR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }
}

/** نمایش روز/ماه/سال شمسی با ارقام فارسی */
export function toFaDigits(s: string | number): string {
  return faNum(s);
}
