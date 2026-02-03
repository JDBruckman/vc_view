"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function toYmd(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function DateRangePicker({
  from,
  to,
  basePath,
  extraParams,
}: {
  from: string;
  to: string;
  basePath: "/overview" | "/compare";
  extraParams?: Record<string, string>;
}) {
  const router = useRouter();

  const initial: DateRange = {
    from: new Date(from + "T00:00:00Z"),
    to: new Date(to + "T00:00:00Z"),
  };

  const [range, setRange] = React.useState<DateRange | undefined>(initial);

  const label = React.useMemo(() => {
    const f = range?.from ? format(range.from, "LLL dd, yyyy") : null;
    const t = range?.to ? format(range.to, "LLL dd, yyyy") : null;
    if (!f && !t) return "Pick a date range";
    if (f && !t) return f;
    return `${f} — ${t}`;
  }, [range]);

  function apply() {
    if (!range?.from || !range?.to) return;

    const params = new URLSearchParams(extraParams ?? {});
    params.set("from", toYmd(range.from));
    params.set("to", toYmd(range.to));

    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start">
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={range}
          onSelect={setRange}
          initialFocus
        />
        <div className="mt-3 flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setRange(undefined)}
          >
            Clear
          </Button>

          <Button onClick={apply} disabled={!range?.from || !range?.to}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
