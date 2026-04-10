import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminAnalytics() {
  const [filter, setFilter] = useState('');
  const [reservas, setReservas] = useState<any[]>([]);
  const [topService, setTopService] = useState<{name: string, count: number} | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const { data } = await supabase.from('reservas').select('*, servicios(nombre), usuarios(nombre)');
    const allRes = data || [];
    setReservas(allRes);

    if (allRes.length > 0) {
      const counts: Record<string, number> = {};
      allRes.forEach(r => {
        const sName = r.servicios?.nombre || 'Sin catalogar';
        counts[sName] = (counts[sName] || 0) + 1;
      });
      // Find top
      const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
      setTopService({ name: sorted[0][0], count: sorted[0][1] });
    }
  };

  const filteredReservas = reservas.filter(r => 
    r.nombre_cliente.toLowerCase().includes(filter.toLowerCase()) ||
    (r.servicios?.nombre || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl">
      <h1 className="text-3xl font-oswald text-white uppercase tracking-wider">Centro de Análisis</h1>

      {/* Métrica Destacada */}
      <div className="bg-gradient-to-r from-[#FACC15] to-yellow-600 p-8 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-center text-black">
         <div>
           <p className="font-bold uppercase tracking-widest text-sm mb-2 opacity-80 backdrop-blur-sm">🔥 Servicio de Mayor Demanda</p>
           <h2 className="font-oswald text-4xl md:text-5xl font-black uppercase">{topService ? topService.name : 'Calculando...'}</h2>
         </div>
         <div className="text-right mt-6 md:mt-0">
           <span className="text-6xl md:text-7xl font-oswald font-black opacity-40">{topService ? topService.count : 0}</span>
           <p className="font-bold uppercase tracking-widest text-sm">Citas Históricas</p>
         </div>
      </div>

      {/* Tabla de Resultados Dinámicos */}
      <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333]">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
           <h3 className="font-oswald text-xl text-white uppercase tracking-wider shrink-0">Registro de Clientes</h3>
           <input 
             type="text" 
             placeholder="Filtrar por nombre o servicio..." 
             className="bg-[#222] border border-[#444] text-white p-3 rounded focus:border-[#FACC15] outline-none w-full md:w-auto min-w-[300px] font-inter text-sm"
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
           />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400 font-inter">
            <thead className="text-xs text-white uppercase bg-[#333]">
               <tr>
                 <th className="px-6 py-4">Cliente</th>
                 <th className="px-6 py-4">Fecha</th>
                 <th className="px-6 py-4">Servicio Adquirido</th>
                 <th className="px-6 py-4">Atendido por</th>
               </tr>
            </thead>
            <tbody>
              {filteredReservas.map(reserva => {
                const date = new Date(reserva.fecha_hora).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                return (
                <tr key={reserva.id} className="border-b border-[#333] hover:bg-[#222] transition-colors">
                  <td className="px-6 py-4 font-bold text-[#FACC15] uppercase tracking-wide">{reserva.nombre_cliente}</td>
                  <td className="px-6 py-4 capitalize">{date}</td>
                  <td className="px-6 py-4 font-bold opacity-80">{reserva.servicios?.nombre || '-'}</td>
                  <td className="px-6 py-4 uppercase tracking-wider text-xs">{reserva.usuarios?.nombre || '-'}</td>
                </tr>
              )})}
              {filteredReservas.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-gray-600">No se encontraron reservas con el filtro aplicado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
