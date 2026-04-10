import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function BookingFlow() {
  const [paso, setPaso] = useState(1);
  
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [servicios, setServicios] = useState<any[]>([]);
  const [trabajadores, setTrabajadores] = useState<any[]>([]);

  const formatCLP = (monto: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);
  };

  useEffect(() => {
    const fetchServicios = async () => {
      // Fetch ALL services from DB directly (no 'estado' filter, our table doesn't have it)
      const { data } = await supabase.from('servicios').select('*');
      setServicios(data || []);
    };
    fetchServicios();
  }, [paso]);

  const handleSelectService = async (service: any) => {
    setSelectedService(service);
    // Fetch workers assigned to this service via the relational table
    const { data } = await supabase
      .from('trabajador_servicio')
      .select('usuarios(*)')
      .eq('servicio_id', service.id);

    // Filter only active workers
    const workers = data?.map(d => d.usuarios as any).filter(u => u && u.estado) || [];
    setTrabajadores(workers);
    setPaso(2);
  };

  const handleConfirmReservation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nombre = formData.get('nombre') as string;
    
    // Build the reservation date using selected time
    const baseDate = new Date();
    const [hours, minutes] = (selectedTime || "10:00").split(':');
    baseDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const { error } = await supabase.from('reservas').insert([
      {
        trabajador_id: selectedWorker.id,
        servicio_id: selectedService.id,
        nombre_cliente: nombre,
        fecha_hora: baseDate.toISOString()
      }
    ]);
    
    if (error) {
      alert("Error al confirmar la reserva. Intenta de nuevo.");
    } else {
      alert("¡Tu reserva ha sido confirmada con éxito!");
    }

    setPaso(1);
    setSelectedService(null);
    setSelectedWorker(null);
    setSelectedTime(null);
  };

  // Generate time slots from 8am to 8pm
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = (8 + i).toString().padStart(2, '0');
    return `${hour}:00`;
  });

  return (
    <div id="booking-flow" className="min-h-screen bg-[#FAFAFA] text-[#111111] p-6 lg:p-24 font-inter flex flex-col justify-center">
      <div className="max-w-6xl mx-auto w-full">
        
        {paso === 1 && (
          <div className="animate-fadeIn">
            <h2 className="font-oswald text-5xl uppercase font-black tracking-tight mb-12 text-[#111111]">1. Catálogo de Servicios</h2>
            {servicios.length === 0 ? (
               <p className="text-[#4A4A4A]">Cargando servicios…</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {servicios.map(serv => (
                    <button 
                      key={serv.id} 
                      onClick={() => handleSelectService(serv)}
                      className="group bg-white p-8 text-left shadow-sm hover:shadow-2xl border border-transparent hover:border-[#D4AF37] transition-all flex flex-col justify-between h-56 relative overflow-hidden"
                    >
                      <div className="relative z-10">
                        <h3 className="font-oswald text-3xl font-bold uppercase mb-2 group-hover:text-[#D4AF37] transition-colors">{serv.nombre}</h3>
                        <p className="text-2xl font-light font-inter text-[#4A4A4A] bg-white bg-opacity-80 inline-block px-1 rounded">{formatCLP(serv.precio)}</p>
                      </div>
                      <span className="relative z-10 mt-auto uppercase text-xs font-bold tracking-widest flex items-center gap-2">Seleccionar <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span></span>
                      
                      {/* Optional BG image hook */}
                      {serv.url_imagen && <div className="absolute inset-0 bg-cover bg-center opacity-10 grayscale group-hover:grayscale-0 transition-all duration-700 pointer-events-none" style={{ backgroundImage: `url('${serv.url_imagen}')` }}></div>}
                    </button>
                  ))}
                </div>
            )}
          </div>
        )}

        {paso === 2 && (
          <div className="animate-fadeIn">
            <button onClick={() => setPaso(1)} className="text-[#4A4A4A] text-sm uppercase font-bold tracking-widest hover:text-[#D4AF37] mb-8">← Volver a servicios</button>
            <h2 className="font-oswald text-5xl uppercase font-black tracking-tight mb-12">2. Elige a tu Asesor</h2>
            {trabajadores.length === 0 ? (
               <p className="text-[#4A4A4A]">No hay maestros habilitados para este servicio actualmente.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {trabajadores.map(worker => (
                  <button 
                    key={worker.id} 
                    onClick={() => { setSelectedWorker(worker); setPaso(3); }}
                    className="bg-white p-8 shadow-sm flex flex-col items-center hover:-translate-y-2 hover:shadow-xl border border-transparent hover:border-[#D4AF37] transition-all"
                  >
                    <div className="w-24 h-24 bg-gray-200 rounded-full mb-6 border-2 border-white shadow-inner flex items-center justify-center font-oswald text-2xl text-gray-500 overflow-hidden">
                       {worker.nombre?.charAt(0)}
                    </div>
                    <h3 className="font-oswald text-2xl font-bold uppercase">{worker.nombre}</h3>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {paso === 3 && (
          <div className="animate-fadeIn">
            <button onClick={() => setPaso(2)} className="text-[#4A4A4A] text-sm uppercase font-bold tracking-widest hover:text-[#D4AF37] mb-8">← Volver a Asesores</button>
            <h2 className="font-oswald text-5xl uppercase font-black tracking-tight mb-12">3. Horarios con {selectedWorker?.nombre}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {timeSlots.map(hora => (
                <button 
                  key={hora} 
                  onClick={() => { setSelectedTime(hora); setPaso(4); }}
                  className="border-2 border-gray-200 bg-white py-6 font-oswald text-2xl uppercase hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all hover:-translate-y-1"
                >
                  {hora}
                </button>
              ))}
            </div>
          </div>
        )}

        {paso === 4 && (
          <div className="animate-fadeIn w-full max-w-xl mx-auto">
            <button onClick={() => setPaso(3)} className="text-[#4A4A4A] text-sm uppercase font-bold tracking-widest hover:text-[#D4AF37] mb-8">← Volver a Horarios</button>
            <form onSubmit={handleConfirmReservation} className="bg-white p-12 shadow-2xl relative border-t-8 border-[#D4AF37]">
              <h2 className="font-oswald text-5xl uppercase font-black tracking-tight mb-2 text-center text-[#111111]">Ya casi</h2>
              <p className="text-center text-[#4A4A4A] mb-8 uppercase text-sm font-bold tracking-widest">{selectedService?.nombre} - {selectedTime} Hrs - {formatCLP(selectedService?.precio || 0)}</p>
              
              <input name="nombre" required placeholder="Tu Nombre Completo" className="w-full border-b-2 border-gray-200 p-4 mb-6 focus:border-[#D4AF37] bg-[#FAFAFA] focus:bg-white outline-none font-inter transition-colors" />
              <input name="telefono" required placeholder="Tu Número Móvil" className="w-full border-b-2 border-gray-200 p-4 mb-6 focus:border-[#D4AF37] bg-[#FAFAFA] focus:bg-white outline-none font-inter transition-colors" />
              <input type="email" name="correo" required placeholder="Correo de confirmación" className="w-full border-b-2 border-gray-200 p-4 mb-10 focus:border-[#D4AF37] bg-[#FAFAFA] focus:bg-white outline-none font-inter transition-colors" />
              
              <button type="submit" className="bg-[#D4AF37] text-white w-full py-5 font-oswald text-2xl uppercase tracking-widest hover:bg-[#b08d2b] transition-colors shadow-xl">
                Confirmar Reserva
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
