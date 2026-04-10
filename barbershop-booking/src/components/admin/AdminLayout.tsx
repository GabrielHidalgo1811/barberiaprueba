import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Users, LayoutList, BarChart3, Scissors, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#111111] text-gray-200 font-sans flex">
      {/* Sidebar Oscuro */}
      <aside className="w-64 bg-[#1a1a1a] flex flex-col fixed h-full z-20 border-r border-[#333]">
        <div className="h-16 flex items-center justify-center border-b border-[#333]">
          <span className="font-oswald text-2xl uppercase tracking-widest text-[#FACC15] flex gap-2">
            <Scissors size={24}/> L'Elegance
          </span>
        </div>
        <nav className="flex flex-col gap-2 p-4 mt-4">
          <NavLink to="/admin/workers" className={({isActive}) => `flex items-center gap-3 p-3 rounded-md transition-colors font-semibold ${isActive ? 'bg-[#333] text-[#FACC15]' : 'hover:bg-[#222]'}`}>
            <Users size={20} /> Trabajadores
          </NavLink>
          <NavLink to="/admin/services" className={({isActive}) => `flex items-center gap-3 p-3 rounded-md transition-colors font-semibold ${isActive ? 'bg-[#333] text-[#FACC15]' : 'hover:bg-[#222]'}`}>
            <LayoutList size={20} /> Servicios
          </NavLink>
          <NavLink to="/admin/analytics" className={({isActive}) => `flex items-center gap-3 p-3 rounded-md transition-colors font-semibold ${isActive ? 'bg-[#333] text-[#FACC15]' : 'hover:bg-[#222]'}`}>
            <BarChart3 size={20} /> Análisis
          </NavLink>
        </nav>
        <div className="mt-auto p-4">
          <button onClick={handleLogout} className="flex items-center gap-3 p-3 w-full rounded-md text-gray-400 hover:text-white hover:bg-[#222] transition-colors font-semibold">
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen bg-[#111111]">
        {/* Topbar Acento Amarillo */}
        <header className="h-16 shrink-0 bg-[#FACC15] flex items-center justify-end px-8 z-10 shadow-md sticky top-0">
           <div className="flex items-center gap-4 text-black font-bold">
               <span className="uppercase tracking-widest text-sm">Panel Dashboard</span>
               <div className="w-8 h-8 rounded-full bg-black text-[#FACC15] flex items-center justify-center text-xs">AD</div>
           </div>
        </header>

        <main className="p-8 flex-1 animate-fadeIn overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
