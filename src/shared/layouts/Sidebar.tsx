import { ChevronFirst, ChevronLast, Loader2 } from 'lucide-react';
import logo from '@/assets/images/logo.svg';
import { useSidebar } from '../hooks/useSidebar';
import SidebarItemComponent from '../components/SidebarItemComponent';
import { SidebarProvider, useSidebarContext } from '../contexts/SidebarContext';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Link } from 'react-router-dom';

interface SidebarProperties {
  role: 'teacher' | 'student';
}

import { useState } from 'react';

function SidebarContent({ role }: SidebarProperties) {
  const {
    user,
    getUserName,
    getUserInitials,
    roleSpecificLinks,
    commonLinks,
    isLinkActive
  } = useSidebar(role);
  const { expanded, toggleExpanded } = useSidebarContext();
  const { logout } = useAuth();


  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoggingOut(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds delay
    logout();
    setIsLoggingOut(false);
  };

  const isProfileActive = location.pathname === `/${role}/profile`;

  return (
    <nav className="h-full flex flex-col shadow-lg gradient rounded-r-2xl">
      <div className="p-4 pb-2 flex justify-between items-center border-b border-white/20">
        <div className={`overflow-hidden transition-all flex items-center ${expanded ? "w-52" : "w-0"}`}>
          <img src={logo} alt="Kōdō Logo" className="h-12 w-auto" />
          <span className="ml-2 text-white font-bold text-xl tracking-wide">Kōdō</span>
        </div>
        <button
          onClick={toggleExpanded}
          className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          {expanded ? <ChevronFirst size={18} /> : <ChevronLast size={18} />}
        </button>
      </div>

      <ul className="flex-1 px-3 py-3">
        {roleSpecificLinks.map(link => (
          <SidebarItemComponent
            key={link.to}
            icon={link.icon}
            text={link.label}
            to={link.to}
            active={isLinkActive(link.to)}
          />
        ))}

        <div className="my-3 border-t border-white/20"></div>

        {commonLinks.map(link => (
          <SidebarItemComponent
            key={link.to}
            icon={link.icon}
            text={link.label}
            to={link.to}
            active={isLinkActive(link.to)}
          />
        ))}

        <div className="my-3 border-t border-white/20"></div>

        <SidebarItemComponent
          icon="LogOut"
          text={isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
          to="/logout"
          active={false}
          onClick={isLoggingOut ? undefined : handleLogout}
        />
      </ul>

      <div className="border-t border-white/20 flex p-3">
        {user ? (
          <Link
            to={`/${role}/profile`}
            className={`
              flex items-center w-full rounded-lg p-2 -m-2
              transition-all duration-200 group relative
              ${isProfileActive
                ? "bg-white/20 text-white"
                : "hover:bg-white/15 text-white/90 hover:text-white"
              }
            `}
          >
            <img
              src={`https://ui-avatars.com/api/?background=ffccbb&color=fa3747&bold=true&name=${encodeURIComponent(getUserInitials())}`}
              alt="Profile avatar"
              className={`
                w-10 h-10 rounded-full transition-all duration-200
                ${isProfileActive
                  ? "scale-105 shadow-lg ring-2 ring-white/30"
                  : "group-hover:scale-105 group-hover:shadow-lg"
                }
              `}
            />
            <div
              className={`
                flex justify-between items-center
                overflow-hidden transition-all duration-200 ${expanded ? "w-52 ml-3" : "w-0"}
              `}
            >
              <div className="leading-4">
                <h4 className={`
                  font-semibold transition-colors duration-200
                  ${isProfileActive
                    ? "text-white"
                    : "text-white/90 group-hover:text-white"
                  }
                `}>
                  {getUserName()}
                </h4>
                <span className={`
                  text-xs transition-colors duration-200
                  ${isProfileActive
                    ? "text-white/80"
                    : "text-white/70 group-hover:text-white/80"
                  }
                `}>
                  {user.email}
                </span>
              </div>
              <div className={`
                transition-opacity duration-200
                ${isProfileActive
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
                }
              `}>

              </div>
            </div>

            {/* Tooltip pour le sidebar fermé */}
            {!expanded && (
              <div className="
                absolute left-full rounded-lg px-4 py-2 ml-6
                bg-gray-800 text-white text-sm
                invisible opacity-0 -translate-x-3 transition-all
                group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
                z-50 whitespace-nowrap shadow-lg border border-gray-700
                min-w-max
              ">
                Voir le profil
              </div>
            )}
          </Link>
        ) : (
          // Alternative si les données de l'utilisateur ne sont pas disponibles
          <div className="flex items-center w-full">
            <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse"></div>
            <div
              className={`
                flex justify-between items-center
                overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
              `}
            >
              <div className="leading-4">
                <div className="h-4 bg-white/10 rounded animate-pulse mb-1"></div>
                <div className="h-3 bg-white/10 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      {isLoggingOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center gradient">
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin text-white" size={48} />
            <span className="mt-4 text-white text-lg font-semibold">Déconnexion...</span>
          </div>
        </div>
      )}
    </nav>
  );
}

export default function Sidebar(props: SidebarProperties) {
  return (
    <aside className="h-screen">
      <SidebarProvider>
        <SidebarContent {...props} />
      </SidebarProvider>
    </aside>
  );
}
