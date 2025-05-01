import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Users, BookOpen, UserPlus, LogOut } from 'lucide-react';
import { useSidebarContext } from '../contexts/SidebarContext';

interface SidebarItemProperties {
  icon: string;
  text: string;
  active: boolean;
  alert?: boolean;
  to: string;
}

// on map les icones
const iconMap: Record<string, React.ReactNode> = {
  Home: <Home size={20} />,
  Users: <Users size={20} />,
  BookOpen: <BookOpen size={20} />,
  UserPlus: <UserPlus size={20} />,
  LogOut: <LogOut size={20} />
};

const SidebarItemComponent: React.FC<SidebarItemProperties> = ({ icon, text, active, alert, to }) => {
  const { expanded } = useSidebarContext();
  const iconComponent = iconMap[icon] || <Home size={20} />; // par default l'icone est "home" si celui-ci ne charge pas

  return (
    <li className={`
      relative flex items-center py-2 px-3 my-1
      font-medium rounded-md cursor-pointer
      transition-colors group
      ${active
        ? "bg-white/20 text-white"
        : "hover:bg-white/10 text-white/80"}
    `}>
      <Link to={to} className="flex items-center w-full">
        {iconComponent}
        <span
          className={`overflow-hidden transition-all ${
            expanded ? "w-52 ml-3" : "w-0"
          }`}
        >
          {text}
        </span>
        {alert && (
          <div
            className={`absolute right-2 w-2 h-2 rounded bg-red-400 ${
              expanded ? "" : "top-2"
            }`}
          />
        )}
      </Link>
      {!expanded && (
        <div
          className={`
            absolute left-full rounded-md px-2 py-1 ml-6
            bg-white text-red-500 text-sm
            invisible opacity-20 -translate-x-3 transition-all
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
            z-50
          `}
        >
          {text}
        </div>
      )}
    </li>
  );
};

export default SidebarItemComponent;
