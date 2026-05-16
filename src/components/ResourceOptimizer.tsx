import React, { Suspense, useEffect, useState, useRef } from 'react';
import { QuestionCardSkeleton } from './Skeleton';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyComponentProps> = ({ 
  fallback = <QuestionCardSkeleton />, 
  children 
}) => {
  return <Suspense fallback={fallback}>{children}</Suspense>;
};

export const LazyLoadImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement> & {
  placeholder?: string;
}> = ({ src, alt, placeholder = '/placeholder.png', className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-white/10 animate-pulse" />
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={() => setIsLoaded(true)}
          {...props}
        />
      )}
    </div>
  );
};

export const preloadResource = (href: string, as: string, type?: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) {
    link.type = type;
  }
  document.head.appendChild(link);
};

export const prefetchResource = (href: string, as: string) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

export const preloadCriticalCSS = (href: string) => {
  preloadResource(href, 'style', 'text/css');
};

export const preloadCriticalImage = (href: string) => {
  preloadResource(href, 'image');
};

export const preloadCriticalFont = (href: string, fontType: string = 'font/woff2') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = 'font';
  link.type = fontType;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

export const ResourceOptimizer: React.FC = () => {
  useEffect(() => {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn.saveData) {
        console.log('用户启用了省流模式，跳过预加载');
        return;
      }
    }

    const criticalResources = [
      { href: '/favicon.svg', as: 'image', type: 'image/svg+xml' },
    ];

    criticalResources.forEach(({ href, as, type }) => {
      preloadResource(href, as, type);
    });
  }, []);

  return null;
};

export const useIntersectionObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) => {
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(callback);
    }, options);

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, callback, options]);

  return setRef;
};

export const LazySection: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
}> = ({ children, fallback = null, rootMargin = '200px' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useIntersectionObserver(
    (entry) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    },
    { rootMargin }
  );

  return (
    <div ref={(node) => ref(node as HTMLDivElement)}>
      {isVisible ? children : fallback}
    </div>
  );
};

export class ResourceHintManager {
  private static instance: ResourceHintManager;
  private preloadedResources = new Set<string>();

  private constructor() {}

  static getInstance(): ResourceHintManager {
    if (!ResourceHintManager.instance) {
      ResourceHintManager.instance = new ResourceHintManager();
    }
    return ResourceHintManager.instance;
  }

  preload(href: string, as: string): void {
    if (this.preloadedResources.has(href)) {
      return;
    }
    preloadResource(href, as);
    this.preloadedResources.add(href);
  }

  prefetch(href: string, as: string): void {
    if (this.preloadedResources.has(href)) {
      return;
    }
    prefetchResource(href, as);
    this.preloadedResources.add(href);
  }

  preloadCriticalPath(): void {
    this.preload('/index.html', 'document');
    this.prefetch('/assets/main.js', 'script');
    this.prefetch('/assets/main.css', 'style');
  }
}

export const usePrefetchOnHover = (href: string) => {
  const [isHovered, setIsHovered] = useState(false);
  const resourceManager = ResourceHintManager.getInstance();

  useEffect(() => {
    if (isHovered && href) {
      resourceManager.prefetch(href, 'document');
    }
  }, [isHovered, href]);

  return {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };
};

export const loadScriptAsync = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

export const preloadScript = (src: string): void => {
  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = src;
  document.head.appendChild(link);
};
