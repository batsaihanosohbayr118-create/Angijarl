"use client";

import { useEffect, useState } from "react";

export default function TypewriterText({
  text,
  speed = 32,
  startDelay = 0,
  as: Tag = "span",
  className,
}: {
  text: string;
  speed?: number;
  startDelay?: number;
  as?: "p" | "h1" | "h2" | "span";
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      setDone(true);
      return;
    }

    let i = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    setCount(0);
    setDone(false);

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) {
          if (interval) clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  return (
    <Tag className={`typewriter${done ? " typewriter-done" : ""}${className ? ` ${className}` : ""}`} aria-label={text}>
      <span aria-hidden="true">
        {text.slice(0, count)}
        <span className="typewriter-cursor" />
      </span>
    </Tag>
  );
}
