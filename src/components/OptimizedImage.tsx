import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
}

export default function OptimizedImage({ src, alt, className }: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  
  return (
    <div className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      />
    </div>
  )
}
