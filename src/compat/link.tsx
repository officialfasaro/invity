import React from "react";
import { Link as RouterLink, LinkProps as RouterLinkProps } from "react-router-dom";

export interface NextLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string | { pathname?: string; search?: string };
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  prefetch?: boolean;
  children?: React.ReactNode;
}

const Link = React.forwardRef<HTMLAnchorElement, NextLinkProps>(function Link(
  { href, replace, children, className, ...rest },
  ref
) {
  const targetHref = typeof href === "string" ? href : `${href.pathname || ""}${href.search || ""}`;
  const isExternal =
    targetHref.startsWith("http://") ||
    targetHref.startsWith("https://") ||
    targetHref.startsWith("mailto:") ||
    targetHref.startsWith("tel:") ||
    targetHref.startsWith("//");

  if (isExternal) {
    return (
      <a
        ref={ref}
        href={targetHref}
        className={className}
        target={rest.target || "_blank"}
        rel={rest.rel || "noopener noreferrer"}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <RouterLink
      ref={ref}
      to={targetHref}
      replace={replace}
      className={className}
      {...(rest as Omit<RouterLinkProps, "to">)}
    >
      {children}
    </RouterLink>
  );
});

export default Link;
