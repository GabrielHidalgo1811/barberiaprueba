import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [errorTexto, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('correo', correo)
        .eq('clave', clave)
        .single();

      if (error || !usuario) {
        throw new Error('Credenciales inválidas.');
      }

      if (usuario.rol === 'admin') {
        navigate('/admin/workers');
      } else if (usuario.rol === 'trabajador') {
        localStorage.setItem('trabajador_id', usuario.id);
        navigate('/worker-schedule');
      }
    } catch (err) {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 font-inter">
      <form onSubmit={handleLogin} className="bg-white p-12 max-w-md w-full shadow-2xl flex flex-col gap-6 animate-fadeIn border-t-4 border-[#D4AF37]">
        <h2 className="font-oswald text-4xl uppercase text-[#111111] mb-2 text-center tracking-wide">Acceso Privado</h2>
        <p className="text-center text-[#4A4A4A] text-sm mb-6">Ingresa tus credenciales de L'Elegance</p>
        
        {errorTexto && <p className="text-white bg-red-500 font-bold text-center text-sm p-3 rounded-md animate-shake">{errorTexto}</p>}
        
        <input 
          type="email" 
          placeholder="Correo Electrónico" 
          required 
          className="w-full border-b-2 border-gray-200 p-4 focus:border-[#D4AF37] outline-none font-inter bg-[#FAFAFA] focus:bg-white transition-colors"
          value={correo} 
          onChange={(e) => setCorreo(e.target.value)} 
        />
        
        <input 
          type="password" 
          placeholder="Clave de acceso" 
          required 
          className="w-full border-b-2 border-gray-200 p-4 focus:border-[#D4AF37] outline-none font-inter bg-[#FAFAFA] focus:bg-white transition-colors"
          value={clave} 
          onChange={(e) => setClave(e.target.value)} 
        />

        <button 
          type="submit" 
          disabled={loading}
          className="bg-[#111111] text-white py-5 font-oswald text-xl uppercase tracking-widest mt-6 hover:bg-[#D4AF37] transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Verificando...' : 'Ingresar'}
        </button>
        <button type="button" onClick={() => navigate('/')} className="text-[#4A4A4A] text-xs uppercase font-bold tracking-widest hover:text-[#D4AF37] transition-colors mt-2 text-center">
          ← Volver a la web
        </button>
      </form>
    </div>
  );
};

export default Login;
