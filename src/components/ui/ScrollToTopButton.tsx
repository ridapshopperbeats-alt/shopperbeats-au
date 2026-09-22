"use client";

import { useEffect, useState } from "react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY <= 300) {
        setVisible(false);
        return;
      }

      const footer = document.querySelector(".page-footer");
      const footerVisible = footer
        ? footer.getBoundingClientRect().top < window.innerHeight
        : false;

      setVisible(!footerVisible);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
<button
  onClick={scrollToTop}
  className="fixed bottom-32 right-4 w-14 h-14 bg-black text-white border-none rounded-full cursor-pointer z-[1000] flex items-center justify-center text-[20px]"
>
  ↑
</button>
  );
}