export type ContentCycleType = "tuesday_market" | "thursday_reflection";

export type ContentCycleSchedule = {
  cycleType: ContentCycleType;
  label: string;
  emailSubjectPrefix: string;
  contentType: string;
  cronExpression: string;
  dayName: string;
  istHour: number;
  istMinute: number;
  utcHour: number;
  utcMinute: number;
};

export const CONTENT_CYCLE_SCHEDULES: Record<ContentCycleType, ContentCycleSchedule> = {
  tuesday_market: {
    cycleType: "tuesday_market",
    label: "Tuesday AI/Business",
    emailSubjectPrefix: "Tuesday AI/Business Journal Approval",
    contentType: "AI + business + MBA-level market analysis",
    cronExpression: "0 5 * * 2",
    dayName: "Tuesday",
    istHour: 10,
    istMinute: 30,
    utcHour: 5,
    utcMinute: 0,
  },
  thursday_reflection: {
    cycleType: "thursday_reflection",
    label: "Thursday Career/Reflection",
    emailSubjectPrefix: "Thursday Career/Reflection Journal Approval",
    contentType:
      "career learning, IIM life, internship reflection, portfolio/project reflection, or personal-growth content",
    cronExpression: "0 10 * * 4",
    dayName: "Thursday",
    istHour: 15,
    istMinute: 30,
    utcHour: 10,
    utcMinute: 0,
  },
};

export function getCycleSchedule(cycleType: ContentCycleType) {
  return CONTENT_CYCLE_SCHEDULES[cycleType];
}

export function normalizeCycleType(value: unknown): ContentCycleType | null {
  if (value === "tuesday_market" || value === "tuesday_ai_business" || value === "tuesday") {
    return "tuesday_market";
  }

  if (value === "thursday_reflection" || value === "thursday_career" || value === "thursday") {
    return "thursday_reflection";
  }

  return null;
}

export function getIstParts(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );

  return {
    weekday: parts.weekday,
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    display: `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second} IST`,
  };
}

export function inferCycleTypeForScheduledTime(date = new Date()): ContentCycleType | null {
  const ist = getIstParts(date);

  for (const schedule of Object.values(CONTENT_CYCLE_SCHEDULES)) {
    if (
      ist.weekday === schedule.dayName &&
      ist.hour === schedule.istHour &&
      ist.minute === schedule.istMinute
    ) {
      return schedule.cycleType;
    }
  }

  return null;
}

export function nextSuggestedPostAt(cycleType: ContentCycleType, from = new Date()) {
  const schedule = getCycleSchedule(cycleType);
  const target = new Date(from);
  const utcDay = cycleType === "tuesday_market" ? 2 : 4;
  const currentDay = target.getUTCDay();
  let offset = (utcDay - currentDay + 7) % 7;

  target.setUTCDate(target.getUTCDate() + offset);
  target.setUTCHours(schedule.utcHour, schedule.utcMinute + 15, 0, 0);

  if (target.getTime() <= from.getTime()) {
    offset = 7;
    target.setUTCDate(target.getUTCDate() + offset);
  }

  return target.toISOString();
}
