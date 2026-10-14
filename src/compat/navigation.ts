import {
  useNavigate,
  useSearchParams as useRouterSearchParams,
  useLocation,
  useParams,
} from "react-router-dom";

export function useRouter() {
  const navigate = useNavigate();

  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => {
      // In SPA, refresh can trigger reload or state refetch
      window.location.reload();
    },
    prefetch: () => {
      // No-op in Vite SPA
    },
  };
}

export function useSearchParams(): URLSearchParams {
  const [searchParams] = useRouterSearchParams();
  return searchParams;
}

export function usePathname(): string {
  const location = useLocation();
  return location.pathname;
}

export function redirect(url: string): never {
  window.location.href = url;
  throw new Error(`Redirecting to ${url}`);
}

export function notFound(): never {
  throw new Error("404 Not Found");
}

export { useParams };
