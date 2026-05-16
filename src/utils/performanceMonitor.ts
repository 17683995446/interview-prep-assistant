export interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
  navigation?: PerformanceNavigationTiming;
  paint?: PerformancePaintTiming[];
  measures?: PerformanceMeasure[];
}

export interface WebVitals {
  lcp: number;
  fid: number;
  cls: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.measureLCP();
    this.measureFID();
    this.measureCLS();
    this.measurePaint();
    this.measureNavigation();
    this.measureResourceTiming();

    window.addEventListener('load', () => {
      setTimeout(() => {
        this.logMetrics();
      }, 3000);
    });
  }

  private measureLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;
        
        if (lastEntry) {
          this.metrics.lcp = lastEntry.startTime;
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('LCP measurement not supported');
    }
  }

  private measureFID(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        if (entries.length > 0) {
          const firstEntry = entries[0] as PerformanceEventTiming;
          const fid = firstEntry.processingStart - firstEntry.startTime;
          this.metrics.fid = fid;
        }
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('FID measurement not supported');
    }
  }

  private measureCLS(): void {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries: PerformanceEntry[] = [];

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEntry[];

        for (const entry of entries) {
          const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          
          if (!layoutShift.hadRecentInput) {
            const isSameSession = 
              sessionEntries.length > 0 &&
              (entry.startTime - sessionEntries[sessionEntries.length - 1].startTime) < 1000;

            if (isSameSession) {
              sessionEntries.push(entry);
              sessionValue += layoutShift.value || 0;
            } else {
              sessionEntries = [entry];
              sessionValue = layoutShift.value || 0;
            }

            clsValue = Math.max(clsValue, sessionValue);
          }
        }

        this.metrics.cls = clsValue;
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('CLS measurement not supported');
    }
  }

  private measurePaint(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        this.metrics.paint = list.getEntries() as PerformancePaintTiming[];
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('Paint measurement not supported');
    }
  }

  private measureNavigation(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        this.metrics.navigation = list.getEntries()[0] as PerformanceNavigationTiming;
      });

      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('Navigation measurement not supported');
    }
  }

  private measureResourceTiming(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        this.metrics.measures = list.getEntries() as PerformanceMeasure[];
      });

      observer.observe({ entryTypes: ['measure'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('Resource timing measurement not supported');
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getWebVitals(): WebVitals | null {
    const { lcp, fid, cls } = this.metrics;
    
    if (lcp === undefined && fid === undefined && cls === undefined) {
      return null;
    }

    return {
      lcp: lcp || 0,
      fid: fid || 0,
      cls: cls || 0
    };
  }

  logMetrics(): void {
    const vitals = this.getWebVitals();
    
    if (vitals) {
      console.group('📊 Performance Metrics');
      console.log('LCP (Largest Contentful Paint):', `${vitals.lcp.toFixed(2)}ms`);
      console.log('FID (First Input Delay):', `${vitals.fid.toFixed(2)}ms`);
      console.log('CLS (Cumulative Layout Shift):', vitals.cls.toFixed(4));
      console.groupEnd();
    }

    if (this.metrics.navigation) {
      const nav = this.metrics.navigation;
      console.group('🚀 Navigation Timing');
      console.log('DNS Lookup:', `${(nav.domainLookupEnd - nav.domainLookupStart).toFixed(2)}ms`);
      console.log('TCP Connection:', `${(nav.connectEnd - nav.connectStart).toFixed(2)}ms`);
      console.log('Response Time:', `${(nav.responseEnd - nav.requestStart).toFixed(2)}ms`);
      console.log('DOM Content Loaded:', `${nav.domContentLoadedEventEnd - nav.fetchStart}ms`);
      console.log('Page Load:', `${nav.loadEventEnd - nav.fetchStart}ms`);
      console.groupEnd();
    }

    if (this.metrics.paint) {
      const fcp = this.metrics.paint.find(p => p.name === 'first-contentful-paint');
      if (fcp) {
        this.metrics.fcp = fcp.startTime;
        console.log('FCP (First Contentful Paint):', `${fcp.startTime.toFixed(2)}ms`);
      }
    }
  }

  getScore(): number {
    const vitals = this.getWebVitals();
    if (!vitals) return 0;

    const lcpScore = this.getLCPScore(vitals.lcp);
    const fidScore = this.getFIDScore(vitals.fid);
    const clsScore = this.getCLSScore(vitals.cls);

    return Math.round((lcpScore + fidScore + clsScore) / 3);
  }

  private getLCPScore(lcp: number): number {
    if (lcp <= 2500) return 100;
    if (lcp <= 4000) return 80;
    return 50;
  }

  private getFIDScore(fid: number): number {
    if (fid <= 100) return 100;
    if (fid <= 300) return 80;
    return 50;
  }

  private getCLSScore(cls: number): number {
    if (cls <= 0.1) return 100;
    if (cls <= 0.25) return 80;
    return 50;
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  reportWebVitals(): void {
    const vitals = this.getWebVitals();
    if (vitals && import.meta.env.PROD) {
      console.log('sendWebVitals', vitals);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

export const measurePerformance = () => {
  performanceMonitor.init();
  return performanceMonitor;
};

export const getWebVitals = () => {
  return performanceMonitor.getWebVitals();
};

export const getPerformanceScore = () => {
  return performanceMonitor.getScore();
};

export const logPerformanceMetrics = () => {
  performanceMonitor.logMetrics();
};

export default PerformanceMonitor;
