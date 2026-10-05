export type CouponStatus = 'SCHEDULED' | 'ACTIVE' | 'EXPIRED';

/**
 * Calculates dynamic time-based coupon status based on current server time (Asia/Kolkata)
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
 * Formats date/time strings for display in Asia/Kolkata timezone
 */
export function formatKolkataDateTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return 'N/A';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'Invalid Date';

  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}
