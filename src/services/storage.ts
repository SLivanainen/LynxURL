import { ShortLink, ClickEvent, UserAccount } from '../types';

const STORAGE_KEY_LINKS = 'lynxurl_links_v1';
const STORAGE_KEY_CLICKS = 'lynxurl_clicks_v1';
const STORAGE_KEY_USER = 'lynxurl_user_v1';

export const DEFAULT_USER: UserAccount = {
  id: 'usr_premium_01',
  name: 'Alex Morgan',
  email: 'alex.morgan@company.io',
  role: 'admin',
  apiKey: 'lx_live_8f3a9e2d1c7b45a60e9d2f8c1b4e6a8',
  plan: 'Pro',
  createdAt: '2026-01-15T09:00:00Z',
};

export const GUEST_USER: UserAccount = {
  id: 'usr_guest',
  name: 'Anonymous Visitor',
  email: 'guest@lynxurl.local',
  role: 'guest',
  apiKey: 'lx_guest_public_key',
  plan: 'Free Starter',
  createdAt: new Date().toISOString(),
};

const INITIAL_LINKS: ShortLink[] = [
  {
    id: 'lnk_01',
    slug: 'launch-2026',
    destinationUrl: 'https://github.com/lynxurl/core-platform/releases/v2.4.0',
    title: 'LynxURL Core v2.4 Release Notes',
    tags: ['Product', 'Release', 'GitHub'],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    isActive: true,
    password: null,
    expiresAt: null,
    clickLimit: null,
    clicksCount: 382,
    userId: DEFAULT_USER.id,
    domain: 'lynx.link',
    description: 'Direct link to latest release binaries and documentation.',
    utmParams: {
      source: 'producthunt',
      medium: 'referral',
      campaign: 'spring_launch',
    },
  },
  {
    id: 'lnk_02',
    slug: 'figma-kit',
    destinationUrl: 'https://figma.com/@designsystem/lynx-design-system-2026',
    title: 'Lynx Unified Design System in Figma',
    tags: ['Design', 'Assets'],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    isActive: true,
    password: null,
    expiresAt: null,
    clickLimit: null,
    clicksCount: 215,
    userId: DEFAULT_USER.id,
    domain: 'lynx.link',
    description: 'Component library and token specs for contributors.',
  },
  {
    id: 'lnk_03',
    slug: 'secure-brief',
    destinationUrl: 'https://docs.google.com/document/d/1yZ_QuarterlyFinancialBriefing',
    title: 'Q1 Investor Briefing (Password Protected)',
    tags: ['Confidential', 'Finance'],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    isActive: true,
    password: 'investor2026',
    expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
    clickLimit: 100,
    clicksCount: 46,
    userId: DEFAULT_USER.id,
    domain: 'lynx.link',
    description: 'Encrypted link requiring passcode "investor2026" to access.',
  },
  {
    id: 'lnk_04',
    slug: 'mobile-app',
    destinationUrl: 'https://lynxurl.io/download',
    title: 'Lynx Mobile App (Smart Device Targeting)',
    tags: ['Mobile', 'App'],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    isActive: true,
    password: null,
    expiresAt: null,
    clickLimit: null,
    clicksCount: 164,
    userId: DEFAULT_USER.id,
    domain: 'lynx.link',
    deviceTargeting: {
      iosUrl: 'https://apps.apple.com/app/lynxurl-qr-scanner',
      androidUrl: 'https://play.google.com/store/apps/details?id=io.lynxurl.app',
      desktopUrl: 'https://lynxurl.io/desktop-client',
    },
    description: 'Smart deep-link routing by operating system.',
  },
  {
    id: 'lnk_05',
    slug: 'flash-sale',
    destinationUrl: 'https://store.acme.com/promo/spring-clearance-50',
    title: 'Limited Spring Flash Sale (Expiring)',
    tags: ['Marketing', 'Promo'],
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    isActive: false,
    password: null,
    expiresAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    clickLimit: 500,
    clicksCount: 500,
    userId: DEFAULT_USER.id,
    domain: 'lynx.link',
    description: 'Expired seasonal campaign link.',
  },
];

const REFERRERS = ['Direct', 'Google', 'Twitter / X', 'LinkedIn', 'GitHub', 'ProductHunt', 'Reddit', 'Email Newsletter'];
const COUNTRIES = [
  { name: 'United States', code: 'US' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Germany', code: 'DE' },
  { name: 'Japan', code: 'JP' },
  { name: 'India', code: 'IN' },
  { name: 'Canada', code: 'CA' },
  { name: 'France', code: 'FR' },
  { name: 'Australia', code: 'AU' },
  { name: 'Singapore', code: 'SG' },
];
const BROWSERS: Array<'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Other'> = ['Chrome', 'Safari', 'Firefox', 'Edge'];
const DEVICES: Array<'desktop' | 'mobile' | 'tablet'> = ['desktop', 'mobile', 'tablet'];
const OS_LIST: Array<'macOS' | 'Windows' | 'iOS' | 'Android' | 'Linux'> = ['macOS', 'Windows', 'iOS', 'Android', 'Linux'];

function generateInitialClicks(): ClickEvent[] {
  const clicks: ClickEvent[] = [];
  const now = Date.now();
  
  INITIAL_LINKS.forEach((link) => {
    const totalToGenerate = Math.min(link.clicksCount, 80); // sample set for deep analytics
    for (let i = 0; i < totalToGenerate; i++) {
      const daysAgo = Math.random() * 7;
      const ts = new Date(now - daysAgo * 86400000 - Math.random() * 3600000 * 20).toISOString();
      const ref = REFERRERS[Math.floor(Math.random() * REFERRERS.length)];
      const c = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
      const dev = DEVICES[Math.random() < 0.6 ? 0 : (Math.random() < 0.8 ? 1 : 2)];
      const browser = BROWSERS[Math.floor(Math.random() * BROWSERS.length)];
      const os = dev === 'desktop' 
        ? (Math.random() < 0.5 ? 'macOS' : (Math.random() < 0.8 ? 'Windows' : 'Linux'))
        : (Math.random() < 0.6 ? 'iOS' : 'Android');

      clicks.push({
        id: `clk_${link.id}_${i}`,
        linkId: link.id,
        slug: link.slug,
        timestamp: ts,
        referrer: ref,
        country: c.name,
        countryCode: c.code,
        device: dev,
        browser,
        os,
        ip: `198.51.100.${Math.floor(Math.random() * 254) + 1}`,
      });
    }
  });

  return clicks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export class StorageService {
  private static getStorageItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }

  private static setStorageItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage quota exceeded or storage unavailable:', e);
    }
  }

  static initialize(): void {
    if (!localStorage.getItem(STORAGE_KEY_LINKS)) {
      this.setStorageItem(STORAGE_KEY_LINKS, INITIAL_LINKS);
    }
    if (!localStorage.getItem(STORAGE_KEY_CLICKS)) {
      this.setStorageItem(STORAGE_KEY_CLICKS, generateInitialClicks());
    }
    if (!localStorage.getItem(STORAGE_KEY_USER)) {
      this.setStorageItem(STORAGE_KEY_USER, DEFAULT_USER);
    }
  }

  static getCurrentUser(): UserAccount {
    return this.getStorageItem<UserAccount>(STORAGE_KEY_USER, DEFAULT_USER);
  }

  static setCurrentUser(user: UserAccount): void {
    this.setStorageItem(STORAGE_KEY_USER, user);
  }

  static switchUserRole(role: 'admin' | 'user' | 'guest'): UserAccount {
    let updated: UserAccount;
    if (role === 'guest') {
      updated = GUEST_USER;
    } else if (role === 'admin') {
      updated = DEFAULT_USER;
    } else {
      updated = {
        id: 'usr_starter_99',
        name: 'Jordan Lee',
        email: 'jordan.lee@example.com',
        role: 'user',
        apiKey: 'lx_live_user_test_token_2026',
        plan: 'Free Starter',
        createdAt: '2026-02-01T12:00:00Z',
      };
    }
    this.setCurrentUser(updated);
    return updated;
  }

  static getAllLinks(): ShortLink[] {
    return this.getStorageItem<ShortLink[]>(STORAGE_KEY_LINKS, INITIAL_LINKS);
  }

  static getLinkById(id: string): ShortLink | undefined {
    const links = this.getAllLinks();
    return links.find((l) => l.id === id);
  }

  static getLinkBySlug(slug: string): ShortLink | undefined {
    const links = this.getAllLinks();
    return links.find((l) => l.slug.toLowerCase() === slug.toLowerCase().trim());
  }

  static isSlugAvailable(slug: string, excludeLinkId?: string): boolean {
    const sanitized = slug.trim().toLowerCase();
    const reserved = ['admin', 'api', 'analytics', 'dashboard', 'login', 'signup', 's', 'r', 'export', 'bulk', 'qr'];
    if (reserved.includes(sanitized)) return false;
    const links = this.getAllLinks();
    return !links.some((l) => l.slug.toLowerCase() === sanitized && l.id !== excludeLinkId);
  }

  static generateUniqueSlug(length = 6): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let slug = '';
    let attempts = 0;
    do {
      slug = '';
      for (let i = 0; i < length; i++) {
        slug += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      attempts++;
    } while (!this.isSlugAvailable(slug) && attempts < 50);
    return slug;
  }

  static saveLink(linkData: Omit<ShortLink, 'id' | 'createdAt' | 'updatedAt' | 'clicksCount'> & { id?: string }): ShortLink {
    const links = this.getAllLinks();
    const now = new Date().toISOString();

    if (linkData.id) {
      // Update existing
      const index = links.findIndex((l) => l.id === linkData.id);
      if (index === -1) throw new Error('Link not found');
      
      const existing = links[index];
      const updated: ShortLink = {
        ...existing,
        ...linkData,
        id: existing.id,
        updatedAt: now,
        clicksCount: existing.clicksCount,
      };
      links[index] = updated;
      this.setStorageItem(STORAGE_KEY_LINKS, links);
      return updated;
    } else {
      // Create new
      const id = 'lnk_' + Math.random().toString(36).substring(2, 10);
      const newLink: ShortLink = {
        ...linkData,
        id,
        clicksCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      links.unshift(newLink);
      this.setStorageItem(STORAGE_KEY_LINKS, links);
      return newLink;
    }
  }

  static deleteLink(id: string): void {
    const links = this.getAllLinks().filter((l) => l.id !== id);
    this.setStorageItem(STORAGE_KEY_LINKS, links);
    
    // Also remove associated click records
    const clicks = this.getAllClicks().filter((c) => c.linkId !== id);
    this.setStorageItem(STORAGE_KEY_CLICKS, clicks);
  }

  static toggleLinkActive(id: string): ShortLink {
    const links = this.getAllLinks();
    const link = links.find((l) => l.id === id);
    if (!link) throw new Error('Link not found');
    link.isActive = !link.isActive;
    link.updatedAt = new Date().toISOString();
    this.setStorageItem(STORAGE_KEY_LINKS, links);
    return link;
  }

  static getAllClicks(): ClickEvent[] {
    return this.getStorageItem<ClickEvent[]>(STORAGE_KEY_CLICKS, []);
  }

  static recordClick(slug: string, simulatedUserMeta?: Partial<ClickEvent>): { success: boolean; link: ShortLink; targetUrl: string; reason?: string } {
    const link = this.getLinkBySlug(slug);
    if (!link) {
      throw new Error(`Short link "${slug}" does not exist.`);
    }

    // Check active status
    if (!link.isActive) {
      return { success: false, link, targetUrl: link.destinationUrl, reason: 'This link has been paused by its creator.' };
    }

    // Check expiration
    if (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now()) {
      return { success: false, link, targetUrl: link.destinationUrl, reason: 'This link has expired.' };
    }

    // Check click limit
    if (link.clickLimit && link.clicksCount >= link.clickLimit) {
      return { success: false, link, targetUrl: link.destinationUrl, reason: 'This link has reached its maximum click limit.' };
    }

    // Determine target URL based on device targeting
    let finalUrl = link.destinationUrl;
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);

    if (isIOS && link.deviceTargeting?.iosUrl) {
      finalUrl = link.deviceTargeting.iosUrl;
    } else if (isAndroid && link.deviceTargeting?.androidUrl) {
      finalUrl = link.deviceTargeting.androidUrl;
    } else if (!isIOS && !isAndroid && link.deviceTargeting?.desktopUrl) {
      finalUrl = link.deviceTargeting.desktopUrl;
    }

    // Append UTM parameters if configured
    if (link.utmParams) {
      try {
        const urlObj = new URL(finalUrl);
        if (link.utmParams.source) urlObj.searchParams.set('utm_source', link.utmParams.source);
        if (link.utmParams.medium) urlObj.searchParams.set('utm_medium', link.utmParams.medium);
        if (link.utmParams.campaign) urlObj.searchParams.set('utm_campaign', link.utmParams.campaign);
        if (link.utmParams.term) urlObj.searchParams.set('utm_term', link.utmParams.term);
        if (link.utmParams.content) urlObj.searchParams.set('utm_content', link.utmParams.content);
        finalUrl = urlObj.toString();
      } catch {
        // keep finalUrl
      }
    }

    // Record click event
    const links = this.getAllLinks();
    const lIndex = links.findIndex((l) => l.id === link.id);
    if (lIndex !== -1) {
      links[lIndex].clicksCount += 1;
      links[lIndex].updatedAt = new Date().toISOString();
      this.setStorageItem(STORAGE_KEY_LINKS, links);
    }

    const clicks = this.getAllClicks();
    const dev: 'desktop' | 'mobile' | 'tablet' = isIOS || isAndroid ? 'mobile' : 'desktop';
    const clickEvent: ClickEvent = {
      id: 'clk_' + Math.random().toString(36).substring(2, 10),
      linkId: link.id,
      slug: link.slug,
      timestamp: new Date().toISOString(),
      referrer: document.referrer ? (new URL(document.referrer).hostname || 'Direct') : 'Direct',
      country: simulatedUserMeta?.country || 'United States',
      countryCode: simulatedUserMeta?.countryCode || 'US',
      city: simulatedUserMeta?.city || 'San Francisco',
      device: simulatedUserMeta?.device || dev,
      browser: simulatedUserMeta?.browser || 'Chrome',
      os: simulatedUserMeta?.os || (isIOS ? 'iOS' : isAndroid ? 'Android' : 'macOS'),
      ip: simulatedUserMeta?.ip || `198.51.100.${Math.floor(Math.random() * 250) + 1}`,
    };

    clicks.unshift(clickEvent);
    this.setStorageItem(STORAGE_KEY_CLICKS, clicks);

    return { success: true, link: links[lIndex] || link, targetUrl: finalUrl };
  }

  static getAnalytics(linkId?: string, timeRange: '24h' | '7d' | '30d' | 'all' = '7d') {
    const allClicks = this.getAllClicks();
    const now = Date.now();
    let cutoff = 0;

    if (timeRange === '24h') cutoff = now - 24 * 3600000;
    else if (timeRange === '7d') cutoff = now - 7 * 86400000;
    else if (timeRange === '30d') cutoff = now - 30 * 86400000;

    const filteredClicks = allClicks.filter((c) => {
      const matchLink = !linkId || linkId === 'all' || c.linkId === linkId;
      const matchTime = cutoff === 0 || new Date(c.timestamp).getTime() >= cutoff;
      return matchLink && matchTime;
    });

    const totalClicks = filteredClicks.length;
    const uniqueIps = new Set(filteredClicks.map((c) => c.ip)).size;

    // Referrers
    const referrersCount: Record<string, number> = {};
    filteredClicks.forEach((c) => {
      const r = c.referrer || 'Direct';
      referrersCount[r] = (referrersCount[r] || 0) + 1;
    });
    const referrers = Object.entries(referrersCount)
      .map(([name, count]) => ({ name, count, percentage: totalClicks ? Math.round((count / totalClicks) * 100) : 0 }))
      .sort((a, b) => b.count - a.count);

    // Countries
    const countryCount: Record<string, { count: number; code: string }> = {};
    filteredClicks.forEach((c) => {
      if (!countryCount[c.country]) {
        countryCount[c.country] = { count: 0, code: c.countryCode };
      }
      countryCount[c.country].count += 1;
    });
    const countries = Object.entries(countryCount)
      .map(([name, data]) => ({
        name,
        code: data.code,
        count: data.count,
        percentage: totalClicks ? Math.round((data.count / totalClicks) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Devices
    const devicesCount: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
    filteredClicks.forEach((c) => {
      devicesCount[c.device] = (devicesCount[c.device] || 0) + 1;
    });

    // Browsers
    const browsersCount: Record<string, number> = {};
    filteredClicks.forEach((c) => {
      browsersCount[c.browser] = (browsersCount[c.browser] || 0) + 1;
    });

    // Timeline buckets
    const timeline: { label: string; clicks: number }[] = [];
    const bucketCount = timeRange === '24h' ? 12 : timeRange === '7d' ? 7 : 14;
    
    for (let i = bucketCount - 1; i >= 0; i--) {
      let bucketStart: number;
      let bucketEnd: number;
      let label: string;

      if (timeRange === '24h') {
        bucketStart = now - (i + 1) * 2 * 3600000;
        bucketEnd = now - i * 2 * 3600000;
        const d = new Date(bucketEnd);
        label = `${d.getHours()}:00`;
      } else {
        const dayMs = 86400000;
        bucketStart = now - (i + 1) * dayMs;
        bucketEnd = now - i * dayMs;
        const d = new Date(bucketEnd);
        label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }

      const count = filteredClicks.filter((c) => {
        const t = new Date(c.timestamp).getTime();
        return t >= bucketStart && t < bucketEnd;
      }).length;

      timeline.push({ label, clicks: count });
    }

    return {
      totalClicks,
      uniqueVisitors: uniqueIps,
      referrers,
      countries,
      devices: devicesCount,
      browsers: Object.entries(browsersCount).map(([name, count]) => ({ name, count })),
      timeline,
      recentClicks: filteredClicks.slice(0, 15),
    };
  }

  static resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEY_LINKS);
    localStorage.removeItem(STORAGE_KEY_CLICKS);
    localStorage.removeItem(STORAGE_KEY_USER);
    this.initialize();
  }

  static exportDatabaseJson(): string {
    return JSON.stringify(
      {
        version: '2.4.0',
        exportedAt: new Date().toISOString(),
        user: this.getCurrentUser(),
        links: this.getAllLinks(),
        clicks: this.getAllClicks(),
      },
      null,
      2
    );
  }
}
