import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LogOut, Scissors, Settings, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const DAY_LABELS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];

export default function WorkerSchedule() {
  const navigate = useNavigate();
  const [daysOfWeek, setDaysOfWeek] = useState<Date[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [reservations, setReservations] = useState<any[]>([]);
  
  // Availability Config
  const [showConfig, setShowConfig] = useState(false);
  const [horaEntrada, setHoraEntrada] = useState('08:00');
  const [horaSalida, setHoraSalida] = useState('20:00');
  const [diasActivos, setDiasActivos] = useState<boolean[]>([true, true, true, true, true, true, false]); // LUN-DOM
  const [savingConfig, setSavingConfig] = useState(false);

  // Modal for booking detail
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Generate hours array dynamically based on horaEntrada/horaSalida
  const generateHours = () => {
    const start = parseInt(horaEntrada.split(':')[0]);
    const end = parseInt(horaSalida.split(':')[0]);
    return Array.from({ length: end - start }, (_, i) => {
      const h = (start + i).toString().padStart(2, '0');
      return `${h}:00`;
    });
  };

  const hours = generateHours();

  // Initialization: Get current Monday + load worker config
  useEffect(() => {
    const today = new Date();
    const diff = today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
    loadWorkerConfig();
  }, []);

  const loadWorkerConfig = async () => {
    const workerId = localStorage.getItem('trabajador_id');
    if (!workerId) return;
    const { data } = await supabase.from('usuarios').select('hora_entrada, hora_salida, dias_activos').eq('id', workerId).single();
    if (data) {
      if (data.hora_entrada) setHoraEntrada(data.hora_entrada);
      if (data.hora_salida) setHoraSalida(data.hora_salida);
      if (data.dias_activos) setDiasActivos(data.dias_activos);
    }
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    const workerId = localStorage.getItem('trabajador_id');
    if (!workerId) return;
    await supabase.from('usuarios').update({
      hora_entrada: horaEntrada,
      hora_salida: horaSalida,
      dias_activos: diasActivos,
    }).eq('id', workerId);
    setSavingConfig(false);
    setShowConfig(false);
  };

  // Update days array and fetch data when currentWeekStart changes
  useEffect(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
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
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    const { data } = await supabase
      .from('reservas')
      .select('*, servicios(nombre)')
      .eq('trabajador_id', workerId)
      .gte('fecha_hora', start.toISOString())
      .lte('fecha_hora', endDate.toISOString());
    if (data) setReservations(data);
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

  // Generate hour options for selectors
  const hourOptions = Array.from({ length: 15 }, (_, i) => {
    const h = (6 + i).toString().padStart(2, '0');
    return `${h}:00`;
  });

  return (
    <div className="min-h-[100dvh] bg-[#111111] text-white p-4 md:p-8 font-inter flex flex-col overflow-hidden">

      <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 max-w-7xl mx-auto w-full border-b border-[#333] pb-6">
        <div className="flex items-center gap-6">
          <span className="font-oswald text-2xl uppercase tracking-widest text-[#FACC15] flex items-center gap-2 border-r border-[#333] pr-6">
            <Scissors size={24} /> L'Elegance
          </span>
          <div>
            <h1 className="text-xl md:text-3xl font-oswald uppercase text-white tracking-widest">Mi Agenda</h1>
            <p className="text-xs md:text-sm text-[#FACC15] tracking-widest opacity-80 uppercase font-bold">Semana del {daysOfWeek[0]?.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} al {daysOfWeek[6]?.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-center">
          <button onClick={() => setShowConfig(!showConfig)} className={`p-3 border rounded transition ${showConfig ? 'bg-[#FACC15] text-black border-[#FACC15]' : 'bg-[#222] border-[#333] text-gray-400 hover:text-[#FACC15] hover:border-[#FACC15]'}`}>
            <Settings size={20} />
          </button>
          <div className="flex bg-[#1a1a1a] rounded border border-[#333]">
            <button onClick={navPrevWeek} className="p-3 hover:bg-[#FACC15] hover:text-black transition">
              <ChevronLeft size={20} />
            </button>
            <span className="font-bold text-xs uppercase tracking-widest flex items-center px-6">Semana</span>
            <button onClick={navNextWeek} className="p-3 hover:bg-[#FACC15] hover:text-black transition">
              <ChevronRight size={20} />
            </button>
          </div>
          <button onClick={handleLogout} className="bg-[#222] border border-[#333] p-3 text-red-500 hover:bg-red-500 hover:text-white transition rounded">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* ============ AVAILABILITY CONFIG PANEL ============ */}
      {showConfig && (
        <div className="max-w-7xl mx-auto w-full mb-6 bg-[#1a1a1a] border border-[#333] rounded-lg p-6 animate-fadeIn">
          <h3 className="font-oswald text-lg uppercase tracking-widest text-[#FACC15] mb-6">Configurar Disponibilidad</h3>

          {/* Hour selectors */}
          <div className="flex flex-wrap gap-6 mb-6">
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Entrada:</label>
              <select value={horaEntrada} onChange={e => setHoraEntrada(e.target.value)} className="bg-[#222] border border-[#444] text-white p-2 rounded focus:border-[#FACC15] outline-none">
                {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Salida:</label>
              <select value={horaSalida} onChange={e => setHoraSalida(e.target.value)} className="bg-[#222] border border-[#444] text-white p-2 rounded focus:border-[#FACC15] outline-none">
                {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          {/* Day toggles */}
          <div className="flex flex-wrap gap-3 mb-6">
            {DAY_LABELS.map((day, i) => (
              <button
                key={day}
                onClick={() => {
                  const updated = [...diasActivos];
                  updated[i] = !updated[i];
                  setDiasActivos(updated);
                }}
                className={`px-5 py-3 rounded font-oswald text-sm uppercase tracking-widest font-bold border transition-all ${diasActivos[i]
                  ? 'bg-[#FACC15] text-black border-[#FACC15] shadow-lg shadow-yellow-500/20'
                  : 'bg-[#222] text-gray-500 border-[#444] hover:border-gray-300'
                  }`}
              >
                {day}
              </button>
            ))}
          </div>

          <button onClick={saveConfig} disabled={savingConfig} className="bg-[#FACC15] text-black font-bold uppercase tracking-widest px-8 py-3 rounded hover:bg-yellow-300 transition text-sm disabled:opacity-50">
            {savingConfig ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      )}

      {/* ============ CALENDAR GRID ============ */}
      <div className="flex-1 w-full max-w-7xl mx-auto overflow-auto bg-[#1a1a1a] border border-[#333] rounded-lg shadow-2xl custom-scrollbar relative">
        <div className="min-w-[800px]">
          {/* Day headers */}
          <div className="grid grid-cols-8 border-b border-[#333] sticky top-0 bg-[#1a1a1a] z-40 shadow-md shadow-black/30">
            <div className="p-4 bg-[#222] border-r border-[#333]"></div>
            {daysOfWeek.map((d, i) => (
              <div key={i} className={`p-4 text-center font-oswald border-r border-[#333] ${!diasActivos[i] ? 'opacity-30' : ''}`}>
                <span className="text-lg font-bold text-gray-300 uppercase tracking-widest block">{DAY_LABELS[i]}</span>
                <span className="text-[#FACC15] text-sm">{d.getDate()}</span>
                {!diasActivos[i] && <span className="block text-[10px] text-red-400 uppercase tracking-widest mt-1">Inactivo</span>}
              </div>
            ))}
          </div>

          {/* Hour rows */}
          <div className="flex flex-col relative z-0">
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-8 border-b border-[#333]">
                <div className="p-4 text-xs font-bold text-gray-500 bg-[#222] flex items-center justify-center border-r border-[#333] shrink-0 sticky left-0 z-30 w-full shadow-sm shadow-black/20">
                  {hour}
                </div>
                {daysOfWeek.map((day, i) => {
                  const booking = reservations.find(r => {
                    const rd = new Date(r.fecha_hora);
                    return rd.getDate() === day.getDate() &&
                      rd.getMonth() === day.getMonth() &&
                      rd.getHours().toString().padStart(2, '0') === hour.split(':')[0];
                  });
                  const isDayOff = !diasActivos[i];

                  return (
                    <div
                      key={i}
                      className={`p-1 border-r border-[#333] transition-colors relative min-h-[80px] ${isDayOff ? 'bg-[#191919]' : booking ? 'bg-[#FACC15] hover:bg-yellow-300' : 'hover:bg-[#222]'}`}
                    >
                      {isDayOff && !booking && (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-[10px] text-gray-600 uppercase tracking-widest">—</span>
                        </div>
                      )}
                      {booking && (
                        <div
                          onClick={() => setSelectedBooking(booking)}
                          className="text-black h-full flex flex-col justify-center px-3 animate-fadeIn rounded-sm bg-yellow-400 select-none overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer shadow-sm"
                        >
                          <strong className="text-sm font-inter leading-tight mb-1 truncate block w-full">{booking.nombre_cliente}</strong>
                          <span className="text-[10px] uppercase font-black tracking-widest opacity-80 block truncate w-full">{booking.servicios?.nombre || 'General'}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ BOOKING DETAIL MODAL ============ */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 animate-fadeIn" onClick={() => setSelectedBooking(null)}>
          <div className="bg-[#1a1a1a] w-full max-w-md rounded-lg border-t-4 border-[#FACC15] shadow-2xl p-8 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedBooking(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition">
              <X size={24} />
            </button>

            <h2 className="font-oswald text-2xl uppercase tracking-widest text-white mb-6">Detalle de Cita</h2>

            <div className="space-y-5">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Cliente</p>
                <p className="text-xl font-bold text-[#FACC15]">{selectedBooking.nombre_cliente}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Fecha</p>
                  <p className="text-white font-inter">{new Date(selectedBooking.fecha_hora).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Hora</p>
                  <p className="text-white font-inter">{new Date(selectedBooking.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Servicio</p>
                <p className="text-[#FACC15] font-oswald text-lg uppercase tracking-widest">{selectedBooking.servicios?.nombre || 'General'}</p>
              </div>
              {selectedBooking.descripcion_extra && (
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Nota del cliente</p>
                  <p className="text-gray-300 font-inter text-sm bg-[#222] p-4 rounded border border-[#333] italic">"{selectedBooking.descripcion_extra}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
