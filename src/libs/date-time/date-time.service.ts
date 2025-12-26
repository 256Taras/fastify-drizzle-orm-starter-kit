import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

/**
 * Date-time service for consistent date handling across the application.
 * Uses dayjs with UTC mode for all operations.
 */
export default function dateTimeService() {
  return {
    /** Get current UTC timestamp as ISO string */
    now(): string {
      return dayjs.utc().toISOString();
    },

    /** Get current UTC date */
    nowDate(): Date {
      return dayjs.utc().toDate();
    },

    /** Parse a date string or Date object and return as ISO string */
    toISOString(date: Date | string): string {
      return dayjs.utc(date).toISOString();
    },

    /** Parse a date string or Date object and return as Date */
    toDate(date: Date | string): Date {
      return dayjs.utc(date).toDate();
    },

    /** Add duration to a date and return as ISO string */
    addMinutes(date: Date | string, minutes: number): string {
      return dayjs.utc(date).add(minutes, "minute").toISOString();
    },

    /** Add hours to a date and return as ISO string */
    addHours(date: Date | string, hours: number): string {
      return dayjs.utc(date).add(hours, "hour").toISOString();
    },

    /** Add days to a date and return as ISO string */
    addDays(date: Date | string, days: number): string {
      return dayjs.utc(date).add(days, "day").toISOString();
    },

    /** Check if first date is before second date */
    isBefore(date1: Date | string, date2: Date | string): boolean {
      return dayjs.utc(date1).isBefore(dayjs.utc(date2));
    },

    /** Check if first date is after second date */
    isAfter(date1: Date | string, date2: Date | string): boolean {
      return dayjs.utc(date1).isAfter(dayjs.utc(date2));
    },

    /** Check if date is in the past */
    isPast(date: Date | string): boolean {
      return dayjs.utc(date).isBefore(dayjs.utc());
    },

    /** Check if date is in the future */
    isFuture(date: Date | string): boolean {
      return dayjs.utc(date).isAfter(dayjs.utc());
    },

    /** Get difference between two dates in minutes */
    diffInMinutes(date1: Date | string, date2: Date | string): number {
      return dayjs.utc(date1).diff(dayjs.utc(date2), "minute");
    },

    /** Get difference between two dates in hours */
    diffInHours(date1: Date | string, date2: Date | string): number {
      return dayjs.utc(date1).diff(dayjs.utc(date2), "hour");
    },
  };
}
