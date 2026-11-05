import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  currentPath: '/',
  navigate: () => {},
});

export function useRouter() {
  return useContext(RouterContext);
}

interface RouterProviderProps {
  children: ReactNode;
  initialPath?: string;
}

export function RouterProvider({ children, initialPath = '/' }: RouterProviderProps) {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return initialPath;
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (to === currentPath) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', to);
      setCurrentPath(to);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
}

export function Link({ to, children, className = '', activeClassName = '', onClick, ...props }: LinkProps) {
  const { currentPath, navigate } = useRouter();
  const isActive = currentPath === to;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    // Don't intercept ctrl/meta clicks (new tab)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    navigate(to);
  };

  const combinedClass = `${className} ${isActive ? activeClassName : ''}`.trim();

  return (
    <a href={to} onClick={handleClick} className={combinedClass} {...props}>
      {children}
    </a>
  );
}
