import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ManageWorkers() {
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [workerHistory, setWorkerHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    // 1. Fetch all workers
    const { data: rawWorkers } = await supabase
      .from('usuarios')
      .select('*')
      .eq('rol', 'trabajador');

    if (!rawWorkers) { setWorkers([]); return; }

    // 2. For each worker, get REAL count and REAL income from reservas + servicios
    const enriched = await Promise.all(rawWorkers.map(async (w) => {
      // Get all reservas for this worker with associated service price
      const { data: reservas } = await supabase
        .from('reservas')
        .select('*, servicios(precio)')
        .eq('trabajador_id', w.id);
      
      const realCount = reservas?.length || 0;
      // Sum up prices from actual services performed
      const realIncome = reservas?.reduce((sum, r) => {
        return sum + (r.servicios?.precio || 0);
      }, 0) || 0;

      return {
        ...w,
        real_servicios: realCount,
        real_ingresos: realIncome,
      };
    }));
    
    setWorkers(enriched);
  };

  const handleSelectWorker = async (worker: any) => {
    if (selectedWorker?.id === worker.id) {
       setSelectedWorker(null);
       setWorkerHistory([]);
       return;
    }
    setSelectedWorker(worker);
    // Fetch real history from reservas table
    const { data } = await supabase
      .from('reservas')
      .select('*, servicios(nombre)')
      .eq('trabajador_id', worker.id)
      .order('fecha_hora', { ascending: false });
    
    setWorkerHistory(data || []);
  };

  const toggleStatus = async (worker: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !worker.estado;
    await supabase.from('usuarios').update({ estado: newState }).eq('id', worker.id);
    setWorkers(workers.map(w => w.id === worker.id ? { ...w, estado: newState } : w));
  };

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-oswald text-white uppercase tracking-wider">Gestión de Talento</h1>
        <button className="bg-[#FACC15] text-black font-bold uppercase tracking-wider px-6 py-3 rounded hover:bg-yellow-300 transition shadow-lg text-sm">
          + Agregar Trabajador
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Lista de Trabajadores */}
         <div className="space-y-4">
           {workers.length === 0 && <p className="text-gray-400">Cargando talento...</p>}
           {workers.map((worker) => (
             <div onClick={() => handleSelectWorker(worker)} key={worker.id} className={`bg-[#1a1a1a] p-6 rounded-lg cursor-pointer transition border border-transparent ${selectedWorker?.id === worker.id ? 'border-[#FACC15]' : 'hover:bg-[#222]'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold font-oswald uppercase tracking-widest">{worker.nombre}</h3>
                  <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => toggleStatus(worker, e as any)}>
                    <input type="checkbox" checked={worker.estado} readOnly className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FACC15]"></div>
                  </label>
                </div>
                <div className="flex gap-6 text-sm text-gray-400 font-inter">
                   <p><strong className="text-white text-lg">${worker.real_ingresos?.toLocaleString('es-CL')}</strong> <span className="text-xs uppercase tracking-widest">CLP</span></p>
                   <p><strong className="text-white text-lg">{worker.real_servicios}</strong> <span className="text-xs uppercase tracking-widest">Servicios</span></p>
                </div>
             </div>
           ))}
         </div>

         {/* Panel Lateral Desglosable (Drill Down) */}
         {selectedWorker ? (
           <div className="bg-[#1a1a1a] p-8 rounded-lg border border-[#333] animate-fadeIn self-start sticky top-8">
             <h2 className="text-2xl font-oswald text-[#FACC15] uppercase tracking-wider mb-2 border-b border-[#333] pb-4">Historial de {selectedWorker.nombre}</h2>
             <p className="text-xs text-gray-500 mb-6 uppercase tracking-widest">{workerHistory.length} reserva(s) registrada(s)</p>
             <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
               {workerHistory.length === 0 ? <p className="text-gray-500 text-sm">Este trabajador no tiene reservas registradas aún.</p> : workerHistory.map(hist => {
                 const d = new Date(hist.fecha_hora);
                 return (
                 <div key={hist.id} className="border-l-4 border-[#FACC15] bg-[#222] p-4 flex flex-col">
                   <span className="text-xs text-gray-400 mb-1">{d.toLocaleString()}</span>
                   <strong className="text-lg text-white mb-1">{hist.nombre_cliente}</strong>
                   <span className="text-sm text-[#FACC15] uppercase font-bold tracking-widest">{hist.servicios?.nombre || 'Servicio General'}</span>
                 </div>
               )})}
             </div>
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center p-12 text-gray-500 bg-[#1a1a1a] rounded-lg border border-dashed border-[#444] self-start mt-4">
             <p className="font-oswald text-xl uppercase tracking-widest mb-2 opacity-50">Selecciona Talento</p>
             <p className="text-sm">Toca el perfil de un maestro para desglosar sus citas.</p>
           </div>
         )}
      </div>
    </div>
  );
}
