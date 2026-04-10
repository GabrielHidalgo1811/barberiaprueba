import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LogOut, Scissors } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function WorkerSchedule() {
  const navigate = useNavigate();
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
  const [daysOfWeek, setDaysOfWeek] = useState<Date[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  
  const [reservations, setReservations] = useState<any[]>([]); // Formato parseado

  // Initialization: Get current Monday
  useEffect(() => {
    const today = new Date();
    // find nearest past Monday
    const diff = today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1); 
    const monday = new Date(today.setDate(diff));
    monday.setHours(0,0,0,0);
    setCurrentWeekStart(monday);
  }, []);

  // Update days array and fetch data when currentWeekStart changes
  useEffect(() => {
    const days = Array.from({length: 7}).map((_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      return d;
    });
    setDaysOfWeek(days);
    
    fetchReservations(days[0], days[6]);
  }, [currentWeekStart]);

  const fetchReservations = async (start: Date, end: Date) => {
    const workerId = localStorage.getItem('trabajador_id');
    if (!workerId) return;

    // Expand search space to include full Day 6
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const { data } = await supabase
      .from('reservas')
      .select('*, servicios(nombre)')
      .eq('trabajador_id', workerId)
      .gte('fecha_hora', start.toISOString())
      .lte('fecha_hora', endDate.toISOString());

    if (data) {
      setReservations(data);
    }
  };

  const navNextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };
  
  const navPrevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const handleLogout = () => {
    localStorage.removeItem('trabajador_id');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white p-4 md:p-8 font-inter flex flex-col">
       
       <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 max-w-7xl mx-auto w-full border-b border-[#333] pb-6">
         <div className="flex items-center gap-6">
           <span className="font-oswald text-2xl uppercase tracking-widest text-[#FACC15] flex items-center gap-2 border-r border-[#333] pr-6">
             <Scissors size={24}/> L'Elegance
           </span>
           <div>
             <h1 className="text-xl md:text-3xl font-oswald uppercase text-white tracking-widest">Mi Agenda</h1>
             <p className="text-xs md:text-sm text-[#FACC15] tracking-widest opacity-80 uppercase font-bold">Semana del {daysOfWeek[0]?.toLocaleDateString('es-ES', {day:'2-digit', month:'short'})} al {daysOfWeek[6]?.toLocaleDateString('es-ES', {day:'2-digit', month:'short'})}</p>
           </div>
         </div>
         
         <div className="flex flex-wrap items-center gap-4 justify-center">
            <div className="flex bg-[#1a1a1a] rounded border border-[#333]">
              <button onClick={navPrevWeek} className="p-3 hover:bg-[#FACC15] hover:text-black transition">
                <ChevronLeft size={20} /> 
              </button>
              <span className="font-bold text-xs uppercase tracking-widest flex items-center px-6">Semana</span>
              <button onClick={navNextWeek} className="p-3 hover:bg-[#FACC15] hover:text-black transition">
                <ChevronRight size={20} />
              </button>
            </div>
            
            <button onClick={handleLogout} className="bg-[#222] border border-[#333] p-3 text-red-500 hover:bg-red-500 hover:text-white transition rounded ml-2">
              <LogOut size={20} />
            </button>
         </div>
       </header>

       <div className="flex-1 w-full max-w-7xl mx-auto overflow-x-auto bg-[#1a1a1a] border border-[#333] rounded-lg shadow-2xl custom-scrollbar relative">
         <div className="min-w-[800px]">
           {/* Cabecera Días */}
           <div className="grid grid-cols-8 border-b border-[#333] sticky top-0 bg-[#1a1a1a] z-10 shadow-sm">
             <div className="p-4 bg-[#222] border-r border-[#333]"></div>
             {daysOfWeek.map((d, i) => {
               const dayNames = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
               return (
               <div key={i} className="p-4 text-center font-oswald border-r border-[#333]">
                 <span className="text-lg font-bold text-gray-300 uppercase tracking-widest block">{dayNames[i]}</span>
                 <span className="text-[#FACC15] text-sm">{d.getDate()}</span>
               </div>
             )})}
           </div>

           {/* Filas del Calendario (8am - 8pm) */}
           <div className="flex flex-col relative z-0">
             {hours.map(hour => (
               <div key={hour} className="grid grid-cols-8 border-b border-[#333] group">
                  <div className="p-4 text-xs font-bold text-gray-500 bg-[#222] flex items-center justify-center border-r border-[#333] shrink-0 sticky left-0 z-10 w-full">
                     {hour}
                  </div>
                  {daysOfWeek.map((day, i) => {
                    // Detect if there's a reservation exactly in this hour for this day
                    const booking = reservations.find(r => {
                      const rd = new Date(r.fecha_hora);
                      return rd.getDate() === day.getDate() && 
                             rd.getMonth() === day.getMonth() &&
                             rd.getHours().toString().padStart(2, '0') === hour.split(':')[0];
                    });
                    
                    return (
                      <div key={i} className={`p-1 border-r border-[#333] transition-colors relative min-h-[90px] ${booking ? 'bg-[#FACC15] hover:bg-yellow-300' : 'hover:bg-[#222]'}`}>
                        {booking && (
                          <div className="text-black h-full flex flex-col justify-center px-3 animate-fadeIn rounded-sm bg-yellow-400 select-none overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer shadow-sm">
                             <strong className="text-sm font-inter leading-tight mb-1 truncate block w-full">{booking.nombre_cliente}</strong>
                             <span className="text-[10px] uppercase font-black tracking-widest opacity-80 block truncate w-full">{booking.servicios?.nombre || 'General'}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
               </div>
             ))}
           </div>
         </div>
       </div>
    </div>
  );
}
