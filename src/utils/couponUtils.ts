/**
 * Coupon Helpers & Timezone Utilities (Asia/Kolkata)
 */

export type CouponStatus = 'SCHEDULED' | 'ACTIVE' | 'EXPIRED';

export interface CouponItem {
  id: string;
  code: string;
  discount_type: 'PERCENT' | 'FIXED';
  discount_value: number;
  min_order_amount: number;
  start_at?: string;
  end_at?: string;
  status?: CouponStatus;
  usage_count?: number;
  is_active?: boolean;
  created_at?: string;
}

/**
 * Calculates dynamic time-based coupon status based on store timezone (Asia/Kolkata)
 */
export function calculateCouponStatus(coupon: { start_at?: string; end_at?: string; is_active?: boolean }, now: Date = new Date()): CouponStatus {
  if (coupon.is_active === false) return 'EXPIRED';
  const nowMs = now.getTime();

  if (coupon.start_at) {
    const startMs = new Date(coupon.start_at).getTime();
    if (nowMs < startMs) return 'SCHEDULED';
  }

  if (coupon.end_at) {
    const endMs = new Date(coupon.end_at).getTime();
    if (nowMs > endMs) return 'EXPIRED';
  }

  return 'ACTIVE';
}

/**
 * Formats ISO timestamp to human-readable date/time string in Asia/Kolkata timezone
 */
export function formatKolkataDateTime(dateInput: string | Date | undefined): { dateStr: string; timeStr: string; fullStr: string } {
  if (!dateInput) return { dateStr: '', timeStr: '', fullStr: 'N/A' };
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return { dateStr: '', timeStr: '', fullStr: 'Invalid Date' };

  try {
    const fullStr = d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Formats for HTML input elements: YYYY-MM-DD and HH:mm in Asia/Kolkata
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(d);

    let year = '', month = '', day = '', hour = '', minute = '';
    for (const part of parts) {
      if (part.type === 'year') year = part.value;
      if (part.type === 'month') month = part.value;
      if (part.type === 'day') day = part.value;
      if (part.type === 'hour') hour = part.value;
      if (part.type === 'minute') minute = part.value;
    }

    const dateStr = `${year}-${month}-${day}`;
    const timeStr = `${hour}:${minute}`;

    return { dateStr, timeStr, fullStr };
  } catch (err) {
    return { dateStr: '', timeStr: '', fullStr: d.toLocaleString() };
  }
}

/**
 * Generates ISO string in Asia/Kolkata given HTML date (YYYY-MM-DD) and time (HH:mm) strings
 */
export function combineDateAndTimeToIso(dateStr: string, timeStr: string): string {
  if (!dateStr || !timeStr) return '';
  // Construct ISO string with +05:30 offset for Asia/Kolkata
  const formattedInput = `${dateStr}T${timeStr}:00+05:30`;
  const d = new Date(formattedInput);
  return d.toISOString();
}

/**
 * Informational countdown relative time label for Admin interface
 */
export function getRelativeTimeLabel(coupon: { start_at?: string; end_at?: string }, now: Date = new Date()): string {
  const status = calculateCouponStatus(coupon, now);
  if (status === 'SCHEDULED' && coupon.start_at) {
    const diffMs = new Date(coupon.start_at).getTime() - now.getTime();
    if (diffMs <= 0) return 'Starts now';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 1) {
      const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return `Starts in ${mins} min${mins > 1 ? 's' : ''}`;
    }
    if (hours < 24) {
      return `Starts in ${hours} hour${hours > 1 ? 's' : ''}`;
    }
    const days = Math.floor(hours / 24);
    return `Starts in ${days} day${days > 1 ? 's' : ''}`;
  }

  if (status === 'ACTIVE' && coupon.end_at) {
    const diffMs = new Date(coupon.end_at).getTime() - now.getTime();
    if (diffMs <= 0) return 'Ending now';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 1) {
      const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return `Ends in ${mins} min${mins > 1 ? 's' : ''}`;
    }
    if (hours < 24) {
      return `Ends in ${hours} hour${hours > 1 ? 's' : ''}`;
    }
    const days = Math.floor(hours / 24);
    return `Ends in ${days} day${days > 1 ? 's' : ''}`;
  }

  return 'Expired';
}
