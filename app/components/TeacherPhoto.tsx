"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function TeacherPhoto({
  photo,
  alt,
  initials,
  className,
  width,
  height,
}: {
  photo?: string;
  alt: string;
  initials: string;
  className: string;
  width: number;
  height: number;
}) {
  const [src, setSrc] = useState(photo);
  const [failed, setFailed] = useState(false);
  const triedResolve = useRef(false);

  useEffect(() => {
    setSrc(photo);
    setFailed(false);
    triedResolve.current = false;
  }, [photo]);

  if (!photo || failed) {
    return (
      <div className={`${className} fallback`} aria-hidden="true">
        {initials}
      </div>
    );
  }

  const handleError = async () => {
    if (triedResolve.current) {
      setFailed(true);
      return;
    }
    triedResolve.current = true;

    try {
      const response = await fetch(`/api/resolve-image?url=${encodeURIComponent(photo)}`);
      const data = (await response.json()) as { imageUrl?: string };
      if (response.ok && data.imageUrl) {
        setSrc(data.imageUrl);
        return;
      }
    } catch {
      // fall through to failed state below
    }
    setFailed(true);
  };

  return (
    <Image
      className={className}
      src={src ?? photo}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      onError={handleError}
    />
  );
}
