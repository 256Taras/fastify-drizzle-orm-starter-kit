import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import type { DateTimeString } from "#types/brands.ts";

dayjs.extend(utc);

export default function dateTimeService() {
  return {
    now(): DateTimeString {
      return dayjs.utc().toISOString() as DateTimeString;
    },

    nowDate(): Date {
      return dayjs.utc().toDate();
    },

    toISOString(date: Date | string): DateTimeString {
      return dayjs.utc(date).toISOString() as DateTimeString;
    },

    toDate(date: Date | string): Date {
      return dayjs.utc(date).toDate();
    },

    addMinutes(date: Date | string, minutes: number): DateTimeString {
      return dayjs.utc(date).add(minutes, "minute").toISOString() as DateTimeString;
    },

    addHours(date: Date | string, hours: number): DateTimeString {
      return dayjs.utc(date).add(hours, "hour").toISOString() as DateTimeString;
    },

    addDays(date: Date | string, days: number): DateTimeString {
      return dayjs.utc(date).add(days, "day").toISOString() as DateTimeString;
    },

    isBefore(date1: Date | string, date2: Date | string): boolean {
      return dayjs.utc(date1).isBefore(dayjs.utc(date2));
    },

    isAfter(date1: Date | string, date2: Date | string): boolean {
      return dayjs.utc(date1).isAfter(dayjs.utc(date2));
    },

    isPast(date: Date | string): boolean {
      return dayjs.utc(date).isBefore(dayjs.utc());
    },

    isFuture(date: Date | string): boolean {
      return dayjs.utc(date).isAfter(dayjs.utc());
    },

    diffInMinutes(date1: Date | string, date2: Date | string): number {
      return dayjs.utc(date1).diff(dayjs.utc(date2), "minute");
    },

    diffInHours(date1: Date | string, date2: Date | string): number {
      return dayjs.utc(date1).diff(dayjs.utc(date2), "hour");
    },
  };
}
