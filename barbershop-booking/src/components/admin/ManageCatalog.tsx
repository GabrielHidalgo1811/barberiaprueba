import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Edit3 } from 'lucide-react';

export default function ManageCatalog() {
  const [servicios, setServicios] = useState<any[]>([]);
  const [allWorkers, setAllWorkers] = useState<any[]>([]);
  
  // Estados para la lectura de los switches
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [assignedWorkerIds, setAssignedWorkerIds] = useState<string[]>([]);
  
  // Estado para Edición de Servicios en Vivo (Modal/Form)
  const [editingService, setEditingService] = useState<any>(null);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [servRes, workRes] = await Promise.all([
      supabase.from('servicios').select('*'),
      supabase.from('usuarios').select('id, nombre').eq('rol', 'trabajador').eq('estado', true)
    ]);
    setServicios(servRes.data || []);
    setAllWorkers(workRes.data || []);
  };

  // Al abrir un servicio, cargamos qué barberos lo enseñan actualmente
  const handleSelectServiceForAssignment = async (serviceId: string) => {
    if (selectedServiceId === serviceId) {
       setSelectedServiceId(null);
       return;
    }
    
    // Si dimos clic, cargamos relaciones activas
    const { data } = await supabase.from('trabajador_servicio').select('trabajador_id').eq('servicio_id', serviceId);
    
    // Generamos un arreglo base numérico con los IDs activos
    const rels = data?.map(d => d.trabajador_id) || [];
    setAssignedWorkerIds(rels);
    setSelectedServiceId(serviceId);
  };

  // Switch Maestro: Al hundir o apagar, contacta con base de datos en directo y actualiza UI
  const toggleWorkerAssignment = async (workerId: string) => {
    const isAssigned = assignedWorkerIds.includes(workerId);
    
    try {
      if (isAssigned) {
        // Rompemos relación
        await supabase.from('trabajador_servicio').delete().match({ trabajador_id: workerId, servicio_id: selectedServiceId });
        setAssignedWorkerIds(prev => prev.filter(id => id !== workerId));
      } else {
        // Enlazamos relación
        await supabase.from('trabajador_servicio').insert({ trabajador_id: workerId, servicio_id: selectedServiceId });
        setAssignedWorkerIds(prev => [...prev, workerId]);
      }
    } catch (e) {
      console.log('Error de Supabase', e);
    }
  };

  // Procesa el Save() del Modal de Edición
  const saveServiceEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    
    const { error } = await supabase.from('servicios').update({
       nombre: editingService.nombre,
       precio: parseFloat(editingService.precio) || 0,
       url_imagen: editingService.url_imagen
    }).eq('id', editingService.id);
    
    if (error) {
      alert("Error al actualizar el servicio");
    } else {
      setEditingService(null);
      fetchData(); // Randerizar fresca
    }
  };

  return (
    <div className="max-w-7xl font-inter">
      <div className="flex justify-between items-center mb-8 border-b border-[#333] pb-4">
        <h1 className="text-3xl font-oswald text-white uppercase tracking-wider">Catálogo Público</h1>
        <button 
          onClick={() => setEditingService({ id: null, nombre: '', precio: 0, url_imagen: '' })} // Use id: null to track New vs Edit
          className="bg-[#FACC15] text-black font-bold uppercase tracking-wider px-6 py-3 rounded hover:bg-yellow-300 transition shadow-lg text-sm shrink-0"
        >
          + Nuevo Servicio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {servicios.map(serv => (
          <div key={serv.id} className="bg-[#1a1a1a] rounded-lg border border-[#333] overflow-hidden flex flex-col shadow-xl">
             
             {/* Componente Gráfico del Servicio */}
             <div className="h-40 w-full bg-black relative group">
               <img src={serv.url_imagen || "https://picsum.photos/400/300"} alt="foto" className="w-full h-full object-cover opacity-60 transition-opacity duration-300" />
               <button 
                 onClick={() => setEditingService(serv)}
                 className="absolute top-4 right-4 bg-[#FACC15] text-black p-2 rounded shadow hover:scale-110 transition flex items-center justify-center opacity-90 hover:opacity-100"
               >
                 <Edit3 size={18} />
               </button>
             </div>

             <div className="p-6 text-center border-b border-[#333]">
                <h3 className="text-2xl font-oswald text-white uppercase tracking-widest leading-none mb-2">{serv.nombre}</h3>
                <p className="text-[#FACC15] font-bold text-lg">{parseFloat(serv.precio).toLocaleString('es-CL', {style:'currency', currency:'CLP'})}</p>
             </div>
             
             {/* Componente Panel Asignados Automático */}
             <div className="p-4 bg-[#222]">
                 <button 
                   onClick={() => handleSelectServiceForAssignment(serv.id)} 
                   className="w-full uppercase text-xs tracking-widest font-bold py-3 border border-[#444] text-gray-300 hover:border-[#FACC15] hover:text-[#FACC15] transition rounded"
                 >
                   {selectedServiceId === serv.id ? 'Cerrar Plantilla' : 'Ajustar Asignaciones / Trabajadores'}
                 </button>

                 {selectedServiceId === serv.id && (
                   <div className="mt-4 space-y-4 animate-fadeIn overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                     {allWorkers.map((w: any) => {
                       const isActive = assignedWorkerIds.includes(w.id);
                       return (
                         <div key={w.id} className="flex justify-between items-center p-3 rounded bg-[#1a1a1a] border border-transparent hover:border-[#FACC15] transition-all">
                            <span className="text-sm font-oswald tracking-widest uppercase text-white">{w.nombre}</span>
                            
                            {/* Diseño Microinteracción Switch amarillo/gris */}
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={isActive} onChange={() => toggleWorkerAssignment(w.id)} className="sr-only peer" />
                              <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FACC15]"></div>
                            </label>
                         </div>
                       )
                     })}
                   </div>
                 )}
             </div>
          </div>
        ))}
      </div>

      {/* MODAL MÁGICO - Edición Fluida  */}
      {editingService && editingService.id && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 animate-fadeIn">
          <form onSubmit={saveServiceEdit} className="bg-[#1a1a1a] w-full max-w-sm rounded-lg p-8 border-t-4 border-[#FACC15] shadow-2xl relative">
             <button type="button" onClick={() => setEditingService(null)} className="absolute top-4 right-6 uppercase text-gray-500 font-bold hover:text-white transition">X</button>
             
             <h2 className="font-oswald text-2xl uppercase tracking-widest mb-8 text-white">Editor Global</h2>

             <p className="text-xs text-gray-500 font-bold uppercase mb-2">Nombre Público:</p>
             <input 
               value={editingService.nombre} 
               onChange={e => setEditingService({...editingService, nombre: e.target.value})} 
               className="w-full bg-[#222] text-white p-3 mb-6 focus:border-[#FACC15] border border-[#444] rounded outline-none" 
             />
             
             <p className="text-xs text-[#FACC15] font-bold uppercase mb-2">Precio en CLP:</p>
             <input 
               type="number"
               value={editingService.precio} 
               onChange={e => setEditingService({...editingService, precio: e.target.value})} 
               className="w-full bg-[#222] text-white p-3 mb-6 focus:border-[#FACC15] border border-[#444] rounded outline-none font-bold text-xl" 
             />

             <p className="text-xs text-gray-500 font-bold uppercase mb-2">URL Imagen:</p>
             <input 
               value={editingService.url_imagen} 
               onChange={e => setEditingService({...editingService, url_imagen: e.target.value})} 
               className="w-full bg-[#222] text-gray-400 p-2 text-sm focus:border-[#FACC15] border border-[#444] rounded outline-none mb-8" 
             />
             
             <button type="submit" className="w-full border-2 border-[#FACC15] text-[#FACC15] font-oswald text-xl uppercase py-4 tracking-widest hover:bg-[#FACC15] hover:text-black transition-colors rounded shadow-lg">
               Guardar y Modificar
             </button>
          </form>
        </div>
      )}
      
      {/* Modal para Crear nuevo servicio */}
      {editingService && !editingService.id && (
         <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 animate-fadeIn">
          <form onSubmit={async (e) => {
            e.preventDefault();
            const { error } = await supabase.from('servicios').insert([{
              nombre: editingService.nombre,
              precio: parseFloat(editingService.precio),
              url_imagen: editingService.url_imagen
            }]);
            if (!error) { setEditingService(null); fetchData(); }
            else alert("Error agregando el servicio.");
          }} className="bg-[#1a1a1a] w-full max-w-sm rounded-lg p-8 border-t-4 border-[#FACC15] shadow-2xl relative">
             <button type="button" onClick={() => setEditingService(null)} className="absolute top-4 right-6 uppercase text-gray-500 font-bold hover:text-white transition">X</button>
             
             <h2 className="font-oswald text-2xl uppercase tracking-widest mb-8 text-white">Nuevo Servicio</h2>

             <p className="text-xs text-gray-500 font-bold uppercase mb-2">Nombre Público:</p>
             <input 
               required
               value={editingService.nombre} 
               onChange={e => setEditingService({...editingService, nombre: e.target.value})} 
               className="w-full bg-[#222] text-white p-3 mb-6 focus:border-[#FACC15] border border-[#444] rounded outline-none" 
             />
             
             <p className="text-xs text-[#FACC15] font-bold uppercase mb-2">Precio en CLP:</p>
             <input 
               type="number"
               required
               value={editingService.precio} 
               onChange={e => setEditingService({...editingService, precio: e.target.value})} 
               className="w-full bg-[#222] text-white p-3 mb-6 focus:border-[#FACC15] border border-[#444] rounded outline-none font-bold text-xl" 
             />

             <p className="text-xs text-gray-500 font-bold uppercase mb-2">URL Imagen (Opcional):</p>
             <input 
               value={editingService.url_imagen} 
               onChange={e => setEditingService({...editingService, url_imagen: e.target.value})} 
               className="w-full bg-[#222] text-gray-400 p-2 text-sm focus:border-[#FACC15] border border-[#444] rounded outline-none mb-8" 
             />
             
             <button type="submit" className="w-full border-2 border-[#FACC15] text-[#FACC15] font-oswald text-xl uppercase py-4 tracking-widest hover:bg-[#FACC15] hover:text-black transition-colors rounded shadow-lg">
               Crear Servicio
             </button>
          </form>
        </div>
      )}

    </div>
  );
}
