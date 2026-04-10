export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  image: string;
  assignedWorkerIds: string[]; // Vínculo de servicio -> trabajador
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  initials: string;
  isActive: boolean;
  totalRevenue: number;
  totalServices: number;
}

export const services: Service[] = [
  { id: '1', name: 'Barbería Clásica', description: 'Corte clásico o moderno según tu estilo.', price: 15, durationMinutes: 30, isActive: true, image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=600', assignedWorkerIds: ['1', '2', '3', '7'] },
  { id: '2', name: 'Arreglo de Barba', description: 'Arreglo, delineado y cuidado de la barba con toalla caliente.', price: 10, durationMinutes: 20, isActive: true, image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600', assignedWorkerIds: ['1', '3', '4', '5'] },
  { id: '3', name: 'Servicio Completo', description: 'Corte + Barba + Lavado relajante con productos premium.', price: 30, durationMinutes: 60, isActive: true, image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600', assignedWorkerIds: ['1', '2', '4', '5'] },
  { id: '4', name: 'Colorimetría', description: 'Tintes de alta calidad y diseños a medida.', price: 40, durationMinutes: 90, isActive: true, image: 'https://images.unsplash.com/photo-1626015523996-3c224e756c07?auto=format&fit=crop&q=80&w=600', assignedWorkerIds: ['2', '4'] },
];

export const workers: Worker[] = [
  { id: '1', name: 'Carlos Díaz', role: 'Maestro Barbero', email: 'carlos@elegance.com', phone: '+34 600 111 222', avatar: 'https://i.pravatar.cc/150?u=carlos', initials: 'CD', isActive: true, totalRevenue: 1250, totalServices: 84 },
  { id: '2', name: 'Miguel Ángel', role: 'Especialista en Color', email: 'miguel@elegance.com', phone: '+34 600 222 333', avatar: 'https://i.pravatar.cc/150?u=miguel', initials: 'MÁ', isActive: true, totalRevenue: 850, totalServices: 45 },
  { id: '3', name: 'Javier Ruiz', role: 'Barbero', email: 'javier@elegance.com', phone: '+34 600 333 444', avatar: 'https://i.pravatar.cc/150?u=javier', initials: 'JR', isActive: true, totalRevenue: 600, totalServices: 40 },
  { id: '4', name: 'Antonio Vega', role: 'Estilista Integral', email: 'antonio@elegance.com', phone: '+34 600 444 555', avatar: 'https://i.pravatar.cc/150?u=antonio', initials: 'AV', isActive: true, totalRevenue: 1800, totalServices: 90 },
  { id: '5', name: 'Luis Navarro', role: 'Barbero', email: 'luis@elegance.com', phone: '+34 600 555 666', avatar: 'https://i.pravatar.cc/150?u=luis', initials: 'LN', isActive: true, totalRevenue: 500, totalServices: 35 },
  { id: '6', name: 'David Serrano', role: 'Aprendiz', email: 'david@elegance.com', phone: '+34 600 666 777', avatar: 'https://i.pravatar.cc/150?u=david', initials: 'DS', isActive: false, totalRevenue: 0, totalServices: 0 },
  { id: '7', name: 'Jorge Marín', role: 'Barbero', email: 'jorge@elegance.com', phone: '+34 600 777 888', avatar: 'https://i.pravatar.cc/150?u=jorge', initials: 'JM', isActive: true, totalRevenue: 900, totalServices: 60 }
];

export const testimonials = [
  { id: '1', client: 'Alberto Gómez', text: 'El cuidado por los detalles es increíble. Sin duda la mejor experiencia que he tenido en años.', rating: 5 },
  { id: '2', client: 'Pablo Herrera', text: 'Desde que descubrí Elegance no confió mi estilo a nadie más. El servicio completo es un lujo.', rating: 5 },
  { id: '3', client: 'Andrés Font', text: 'Una atmósfera inmejorable y profesionales del más alto nivel. Totalmente recomendado.', rating: 5 }
];
