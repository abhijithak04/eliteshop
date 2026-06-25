import { useEffect } from "react";

const ScrollFix = () => {
  useEffect(() => {
    const scrollHandler = (event) => {
      const pathname = window.location.pathname;

      const isHomePage =
        pathname === "/" ||
        pathname === "/home";

      if (!isHomePage) return;

      const target = event.target;

      if (!(target instanceof Element)) return;

      const ignoredArea = target.closest(
        [
          "input",
          "textarea",
          "select",
          "button",
          "a",
          ".dropdown-menu",
          ".modal",
          ".offcanvas",
          ".category-scroll",
          ".elite-home-product-row",
          ".elite-home-brand-marquee",
          ".elite-home-newsletter-form",
        ].join(", ")
      );

      if (ignoredArea) return;

      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      const scrollElement =
        document.scrollingElement ||
        document.documentElement;

      const currentTop = scrollElement.scrollTop;
      const maxTop =
        scrollElement.scrollHeight -
        window.innerHeight;

      const goingDown = event.deltaY > 0;
      const goingUp = event.deltaY < 0;

      const canScrollDown =
        goingDown && currentTop < maxTop - 2;

      const canScrollUp =
        goingUp && currentTop > 2;

      if (!canScrollDown && !canScrollUp) return;

      event.preventDefault();

      scrollElement.scrollBy({
        top: event.deltaY,
        left: 0,
        behavior: "auto",
      });
    };

    window.addEventListener("wheel", scrollHandler, {
      passive: false,
      capture: true,
    });

    return () => {
      window.removeEventListener("wheel", scrollHandler, {
        capture: true,
      });
    };
  }, []);

  return null;
};

export default ScrollFix;