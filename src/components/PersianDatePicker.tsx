import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  PERSIAN_MONTHS,
  PERSIAN_WEEKDAYS,
  isoToJalali,
  jalaliMonthLength,
  jalaliToIso,
  todayIso,
  todayJalali,
  toFaDigits,
} from "../lib/dates";

type Props = {
  value: string; // ISO yyyy-mm-dd
  onChange: (iso: string) => void;
  label?: string;
  required?: boolean;
};

export function PersianDatePicker({ value, onChange, label, required }: Props) {
  const iso = value || todayIso();
  const initial = isoToJalali(iso) || todayJalali();
  const [open, setOpen] = useState(false);
  const [viewJy, setViewJy] = useState(initial.jy);
  const [viewJm, setViewJm] = useState(initial.jm);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = isoToJalali(iso) || todayJalali();

  useEffect(() => {
    if (!open) return;
    const j = isoToJalali(iso) || todayJalali();
    setViewJy(j.jy);
    setViewJm(j.jm);
  }, [open, iso]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const daysInMonth = jalaliMonthLength(viewJy, viewJm);

  // first weekday of month (Sat=0)
  const firstIso = jalaliToIso(viewJy, viewJm, 1);
  const firstDate = new Date(firstIso + "T12:00:00");
  const startPad = (firstDate.getDay() + 1) % 7;

  const prevMonth = () => {
    if (viewJm === 1) {
      setViewJm(12);
      setViewJy((y) => y - 1);
    } else setViewJm((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewJm === 12) {
      setViewJm(1);
      setViewJy((y) => y + 1);
    } else setViewJm((m) => m + 1);
  };

  const pick = (jd: number) => {
    onChange(jalaliToIso(viewJy, viewJm, jd));
    setOpen(false);
  };

  const display = `${toFaDigits(selected.jd)} ${PERSIAN_MONTHS[selected.jm - 1]} ${toFaDigits(selected.jy)}`;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div ref={rootRef} className="relative">
      {label ? (
        <label className="mb-1 block text-[11px] text-white/50">
          {label}{required ? " *" : ""}
        </label>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="field flex w-full items-center justify-between gap-2 text-right"
      >
        <span className="text-[13px] text-white">{display}</span>
        <Calendar size={16} className="shrink-0 text-primary/80" />
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-[60] rounded-2xl border border-white/15 bg-[#1c1c1e] p-3 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 active:bg-white/10">
              <ChevronRight size={18} />
            </button>
            <p className="text-[13px] font-bold text-white">
              {PERSIAN_MONTHS[viewJm - 1]} {toFaDigits(viewJy)}
            </p>
            <button type="button" onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 active:bg-white/10">
              <ChevronLeft size={18} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {PERSIAN_WEEKDAYS.map((w) => (
              <div key={w} className="py-1 text-center text-[10px] font-medium text-white/35">
                {w.slice(0, 1)}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((d, i) => {
              if (d == null) return <div key={`e-${i}`} />;
              const isSel =
                selected.jy === viewJy && selected.jm === viewJm && selected.jd === d;
              const today = todayJalali();
              const isToday = today.jy === viewJy && today.jm === viewJm && today.jd === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => pick(d)}
                  className={`flex h-9 items-center justify-center rounded-xl text-[13px] font-medium transition ${
                    isSel
                      ? "bg-primary text-black"
                      : isToday
                        ? "bg-primary/15 text-primary"
                        : "text-white/80 active:bg-white/10"
                  }`}
                >
                  {toFaDigits(d)}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              onChange(todayIso());
              setOpen(false);
            }}
            className="mt-2 w-full rounded-xl py-2 text-[12px] font-semibold text-primary active:bg-primary/10"
          >
            امروز
          </button>
        </div>
      ) : null}
    </div>
  );
}
