
import React, { useState } from 'react';
import { auth } from '../services/firebase';

const AuthView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        // Fix: Use v8 namespaced API for sign in
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        if (userCredential.user && !userCredential.user.emailVerified) {
          await auth.signOut();
          setError('Debes verificar tu correo electrónico antes de poder acceder. Revisa tu bandeja de entrada.');
          return;
        }
        // onAuthStateChanged in App.tsx will handle navigation
      } else {
        // Fix: Use v8 namespaced API for user creation
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        // Fix: Use sendEmailVerification method on the user object (v8 syntax)
        if (userCredential.user) {
          await userCredential.user.sendEmailVerification();
        }
        setMessage("¡Registro exitoso! Se ha enviado un correo de verificación a tu email.");
        setIsLogin(true); // Switch to login view after successful registration
      }
    } catch (err: any) {
      console.error(err);
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Correo o contraseña incorrectos.');
          break;
        case 'auth/email-already-in-use':
          setError('Este correo electrónico ya está registrado.');
          break;
        case 'auth/weak-password':
          setError('La contraseña debe tener al menos 6 caracteres.');
          break;
        case 'auth/invalid-email':
            setError('El formato del correo electrónico no es válido.');
            break;
        default:
          setError('Ha ocurrido un error. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-brand text-center mb-2">FitFatList</h1>
        <p className="text-center text-ink-muted mb-8">Tu lista de la compra inteligente.</p>

        <div className="bg-surface p-8 rounded-2xl border border-border shadow-card">
          <div className="flex border-b border-border mb-6">
            <button 
              onClick={() => { setIsLogin(true); setError(null); setMessage(null); }}
              className={`flex-1 py-2 font-semibold transition-colors ${isLogin ? 'text-brand border-b-2 border-brand' : 'text-ink-muted'}`}
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(null); setMessage(null); }}
              className={`flex-1 py-2 font-semibold transition-colors ${!isLogin ? 'text-brand border-b-2 border-brand' : 'text-ink-muted'}`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-muted">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-bg border border-border rounded-xl placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-brand sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-muted">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-bg border border-border rounded-xl placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-brand sm:text-sm"
              />
            </div>
            {error && <p className="text-sm text-danger text-center">{error}</p>}
            {message && <p className="text-sm text-accent text-center">{message}</p>}
            <div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-2 inline-flex justify-center py-3 px-4 border border-transparent rounded-xl text-base font-medium text-brand-ink bg-brand hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-brand-ink border-t-transparent rounded-full animate-spin"></div>
                ) : (isLogin ? 'Entrar' : 'Crear Cuenta')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
