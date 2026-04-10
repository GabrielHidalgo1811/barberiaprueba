import { useState, useEffect } from 'react';
import { Scissors, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookingFlow from './BookingFlow';
import { supabase } from '../../lib/supabaseClient';

const LandingPage = () => {
  const [dbWorkers, setDbWorkers] = useState<any[]>([]);

  // Testimonials estáticos de portafolio (son decorativos para la landing, no datos de negocio)
  const testimonials = [
    { id: '1', client: 'Alberto Gómez', text: 'El cuidado por los detalles es increíble. Sin duda la mejor experiencia que he tenido en años.', rating: 5 },
    { id: '2', client: 'Pablo Herrera', text: 'Desde que descubrí Elegance no confío mi estilo a nadie más. El servicio completo es un lujo.', rating: 5 },
    { id: '3', client: 'Andrés Font', text: 'Una atmósfera inmejorable y profesionales del más alto nivel. Totalmente recomendado.', rating: 5 }
  ];

  useEffect(() => {
    const fetchWorkers = async () => {
      const { data } = await supabase
        .from('usuarios')
        .select('id, nombre')
        .eq('rol', 'trabajador')
        .eq('estado', true);
      setDbWorkers(data || []);
    };
    fetchWorkers();
  }, []);

  return (
    <div className="bg-brand-light min-h-screen font-inter w-full text-brand-dark">
      
      {/* Navbar Minimalista */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 font-black tracking-widest uppercase text-xl font-oswald text-white drop-shadow-md">
          <Scissors size={24} className="text-[#D4AF37]" /> L'Elegance
        </div>
        <Link to="/login" className="border-2 border-white text-white hover:bg-white hover:text-black transition flex items-center gap-1 text-sm font-bold uppercase tracking-widest px-6 py-2 shadow-lg">
           Acceso Admin
        </Link>
      </nav>

      {/* Hero Section Inmersivo (Mobile First y Adaptativo) */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 overflow-hidden">
        {/* Imagen de fondo de alta calidad */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1920&q=80')" }}
        ></div>
        
        {/* Filtro oscuro al 60% */}
        <div className="absolute inset-0 bg-black/60"></div>
        
        <div className="relative z-10 max-w-4xl pt-20">
          <h1 className="font-oswald text-6xl md:text-9xl text-white font-black leading-none mb-6 uppercase tracking-tight drop-shadow-2xl">
            El Arte <br /> De Ser <br /> <span className="text-[#D4AF37]">Hombre.</span>
          </h1>
          <p className="font-inter text-gray-200 text-lg md:text-2xl mb-12 max-w-lg font-light leading-relaxed drop-shadow-md">
            Experimenta una barbería premium a otro nivel. Minimalismo, técnica y diseño en cada detalle.
          </p>
          
          <button onClick={() => document.getElementById('booking-flow')?.scrollIntoView({ behavior: 'smooth' })} className="bg-[#D4AF37] text-white font-oswald text-xl md:text-2xl uppercase tracking-[0.2em] py-5 px-10 w-full md:w-auto hover:bg-[#b08d2b] transition-all duration-300 shadow-2xl">
            Reservar Cita Ahora
          </button>
        </div>
      </section>

      {/* Flujo de Reserva Dinámico (SPA DB) */}
      <section>
         <BookingFlow />
      </section>

      {/* Team Section - AHORA CONECTADO A SUPABASE */}
      <section className="py-24 px-6 md:px-16 bg-[#111111] text-white">
         <h2 className="font-oswald text-5xl md:text-7xl font-bold mb-16 uppercase tracking-tight text-center">Maestros <span className="text-[#D4AF37]">Barberos</span></h2>
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
           {dbWorkers.map(worker => (
             <div key={worker.id} className="text-center group">
               <div className="w-32 h-32 md:w-48 md:h-48 mx-auto rounded-full overflow-hidden mb-6 border-2 border-[#4A4A4A] group-hover:border-[#D4AF37] transition-colors duration-300 shadow-lg bg-[#222] flex items-center justify-center">
                 <span className="font-oswald text-4xl text-gray-500 group-hover:text-[#D4AF37] transition-colors">{worker.nombre?.charAt(0)}</span>
               </div>
               <h3 className="font-oswald text-2xl uppercase tracking-wide mb-1 flex justify-center items-center gap-2">
                 {worker.nombre}
               </h3>
               <p className="text-[#D4AF37] font-semibold text-sm uppercase tracking-widest">Maestro Barbero</p>
             </div>
           ))}
           {dbWorkers.length === 0 && <p className="text-gray-500 col-span-full text-center">Cargando equipo...</p>}
         </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 md:px-16 bg-[#FAFAFA] text-center">
        <h2 className="font-oswald text-5xl md:text-7xl font-bold mb-16 uppercase tracking-tight text-[#111111]">La <span className="text-[#D4AF37]">Experiencia</span></h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center max-w-6xl mx-auto">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="bg-white p-10 flex-1 flex flex-col items-center justify-center border-t-4 border-[#D4AF37] shadow-sm hover:shadow-xl transition-shadow">
              <div className="flex gap-1 text-[#D4AF37] mb-6">
                {[...Array(testimonial.rating)].map((_, i) => <Star key={i} fill="currentColor" size={20} />)}
              </div>
              <p className="font-inter text-[#4A4A4A] text-lg italic mb-6 leading-relaxed">"{testimonial.text}"</p>
              <h4 className="font-oswald uppercase tracking-widest font-bold text-[#111111]">{testimonial.client}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111111] py-12 text-center text-[#4A4A4A] font-inter text-sm">
        <div className="flex items-center justify-center gap-2 font-black tracking-widest uppercase text-3xl font-oswald text-white mb-6">
          <Scissors size={28} className="text-[#D4AF37]" /> L'Elegance
        </div>
        <p>&copy; 2026 L'Elegance Barbershop. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
