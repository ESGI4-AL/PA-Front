import { ChevronFirst, ChevronLast } from 'lucide-react';
import logo from '../../assets/images/logo.svg';
import { useSidebar } from '../hooks/useSidebar';
import SidebarItemComponent from '../components/SidebarItemComponent';
import { SidebarProvider, useSidebarContext } from '../contexts/SidebarContext';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface SidebarProperties {
  role: 'teacher' | 'student';
}

function SidebarContent({ role }: SidebarProperties) {
  const {
    user,
    getUserName,
    getUserInitials,
    links,
    isLinkActive
  } = useSidebar(role);
  const { expanded, toggleExpanded } = useSidebarContext();
  const { logout } = useAuth();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

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
        {links.map(link => (
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
          text="Logout"
          to="/logout"
          active={false}
          onClick={handleLogout}
        />
      </ul>
      <div className="border-t border-white/20 flex p-3">
        {user ? (
          <>
            <img
              src={`https://ui-avatars.com/api/?background=ffccbb&color=fa3747&bold=true&name=${encodeURIComponent(getUserInitials())}`}
              alt="Profile avatar"
              className="w-10 h-10 rounded-full"
            />
            <div
              className={`
                flex justify-between items-center
                overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
              `}
            >
              <div className="leading-4">
                <h4 className="font-semibold text-white">{getUserName()}</h4>
                <span className="text-xs text-white/70">{user.email}</span>
              </div>
            </div>
          </>
        ) : (
          // alternative si les données de l'utilisateur ne sont pas disponibles
          <>
            <div className="w-10 h-10 rounded-full bg-white/10"></div>
            <div
              className={`
                flex justify-between items-center
                overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
              `}
            >
              <div className="leading-4">
                <h4 className="font-semibold text-white">Loading...</h4>
                <span className="text-xs text-white/70">Please wait</span>
              </div>
            </div>
          </>
        )}
      </div>
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
