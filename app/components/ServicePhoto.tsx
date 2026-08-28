"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const FALLBACK_PHOTO =
  "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=900";

export default function ServicePhoto({
  photo,
  alt,
  className,
  sizes,
}: {
  photo: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const [src, setSrc] = useState(photo);
  const triedResolve = useRef(false);
  const triedFallback = useRef(false);

  useEffect(() => {
    setSrc(photo);
    triedResolve.current = false;
    triedFallback.current = false;
  }, [photo]);

  const handleError = async () => {
    if (!triedResolve.current) {
      triedResolve.current = true;
      try {
        const response = await fetch(`/api/resolve-image?url=${encodeURIComponent(photo)}`);
        const data = (await response.json()) as { imageUrl?: string };
        if (response.ok && data.imageUrl) {
          setSrc(data.imageUrl);
          return;
        }
      } catch {
        // fall through
      }
    }

    if (!triedFallback.current) {
      triedFallback.current = true;
      setSrc(FALLBACK_PHOTO);
    }
  };

  return (
    <Image
      className={className}
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? "(max-width: 768px) 50vw, 25vw"}
      style={{ objectFit: "cover" }}
      loading="lazy"
      onError={handleError}
    />
  );
}
