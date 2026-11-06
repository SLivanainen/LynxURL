export interface ShortLink {
  id: string;
  slug: string;
  destinationUrl: string;
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  password?: string | null;
  expiresAt?: string | null;
  clickLimit?: number | null;
  clicksCount: number;
  userId: string;
  domain: string;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  deviceTargeting?: {
    iosUrl?: string;
    androidUrl?: string;
    desktopUrl?: string;
  };
  description?: string;
}

export interface ClickEvent {
  id: string;
  linkId: string;
  slug: string;
  timestamp: string;
  referrer: string;
  country: string;
  countryCode: string;
  city?: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Other';
  os: 'macOS' | 'Windows' | 'iOS' | 'Android' | 'Linux';
  ip: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  apiKey: string;
  plan: 'Free Starter' | 'Pro' | 'Enterprise';
  createdAt: string;
}

export interface QRCodeSettings {
  fgColor: string;
  bgColor: string;
  margin: number;
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  logoIcon: 'none' | 'link' | 'qr' | 'sparkle' | 'globe';
  frameStyle: 'none' | 'simple' | 'scan_me' | 'card';
  frameText: string;
}

export type ViewTab = 'shorten' | 'links' | 'analytics' | 'bulk' | 'qr' | 'export';
