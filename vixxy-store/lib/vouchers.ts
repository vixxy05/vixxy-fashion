import { Voucher } from "./types";

const VOUCHERS_KEY = "vixxy_vouchers";
const VOUCHERS_EVENT = "vixxy-vouchers-updated";

const seedVouchers: Voucher[] = [
  {
    code: "VIXXY10",
    discountType: "percent",
    discountValue: 10,
    minOrderValue: 500000,
    maxUsage: 100,
    usedCount: 0,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    isActive: true,
  },
  {
    code: "WELCOME50",
    discountType: "fixed",
    discountValue: 50000,
    minOrderValue: 200000,
    maxUsage: 200,
    usedCount: 0,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    code: "SUPER99",
    discountType: "percent",
    discountValue: 20,
    minOrderValue: 1000000,
    maxUsage: 50,
    usedCount: 0,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  }
];

export function getVouchers(): Voucher[] {
  if (typeof window === "undefined") return seedVouchers;
  try {
    const raw = localStorage.getItem(VOUCHERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore and reseed
  }
  localStorage.setItem(VOUCHERS_KEY, JSON.stringify(seedVouchers));
  return seedVouchers;
}

export function saveVouchers(vouchers: Voucher[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(VOUCHERS_KEY, JSON.stringify(vouchers));
  window.dispatchEvent(new CustomEvent(VOUCHERS_EVENT));
}

export function createVoucher(voucher: Voucher) {
  const vouchers = getVouchers();
  const index = vouchers.findIndex((v) => v.code.toUpperCase() === voucher.code.toUpperCase());
  if (index >= 0) {
    vouchers[index] = voucher;
  } else {
    vouchers.push(voucher);
  }
  saveVouchers(vouchers);
}

export function toggleVoucherStatus(code: string): boolean {
  const vouchers = getVouchers();
  const index = vouchers.findIndex((v) => v.code.toUpperCase() === code.toUpperCase());
  if (index === -1) return false;
  vouchers[index].isActive = !vouchers[index].isActive;
  saveVouchers(vouchers);
  return vouchers[index].isActive;
}

export function validateVoucher(code: string, orderValue: number): {
  valid: boolean;
  discountAmount?: number;
  message?: string;
  voucher?: Voucher;
} {
  const vouchers = getVouchers();
  const voucher = vouchers.find((v) => v.code.toUpperCase() === code.trim().toUpperCase());
  
  if (!voucher) {
    return { valid: false, message: "Mã giảm giá không tồn tại!" };
  }
  
  if (!voucher.isActive) {
    return { valid: false, message: "Mã giảm giá đã bị khóa hoặc hết hạn sử dụng!" };
  }
  
  if (voucher.usedCount >= voucher.maxUsage) {
    return { valid: false, message: "Mã giảm giá đã đạt số lượt sử dụng tối đa!" };
  }
  
  const now = new Date();
  if (now < new Date(voucher.startDate) || now > new Date(voucher.endDate)) {
    return { valid: false, message: "Mã giảm giá đã hết thời gian hiệu lực!" };
  }
  
  if (orderValue < voucher.minOrderValue) {
    return { 
      valid: false, 
      message: `Đơn hàng tối thiểu phải từ ${voucher.minOrderValue.toLocaleString("vi-VN")}đ để áp dụng mã này!` 
    };
  }
  
  let discountAmount = 0;
  if (voucher.discountType === "percent") {
    discountAmount = Math.floor((orderValue * voucher.discountValue) / 100);
  } else {
    discountAmount = voucher.discountValue;
  }
  
  return {
    valid: true,
    discountAmount,
    voucher,
  };
}

export function incrementVoucherUsage(code: string) {
  const vouchers = getVouchers();
  const index = vouchers.findIndex((v) => v.code.toUpperCase() === code.toUpperCase());
  if (index === -1) return;
  vouchers[index].usedCount = Math.min(vouchers[index].maxUsage, vouchers[index].usedCount + 1);
  saveVouchers(vouchers);
}

export function decrementVoucherUsage(code: string) {
  const vouchers = getVouchers();
  const index = vouchers.findIndex((v) => v.code.toUpperCase() === code.toUpperCase());
  if (index === -1) return;
  vouchers[index].usedCount = Math.max(0, vouchers[index].usedCount - 1);
  saveVouchers(vouchers);
}
