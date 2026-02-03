"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PeriodSelect({
  value,
  ids,
  from,
  to,
}: {
  value: "auto" | "daily" | "weekly" | "monthly";
  ids: string[];
  from: string;
  to: string;
}) {
  const router = useRouter();

  function onValueChange(next: string) {
    const params = new URLSearchParams();
    params.set("ids", ids.join(","));
    params.set("from", from);
    params.set("to", to);
    params.set("period", next);
    router.push(`/compare?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm text-muted-foreground">Period</div>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto">Auto</SelectItem>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
