import React, { useState, useEffect, useRef } from 'react'; // Importar useRef
import { useAuth } from '../../core/auth/AuthContext';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, loginAnonymously, setupRecaptcha, loginWithPhone } = useAuth();

  const [authType, setAuthType] = useState<'login' | 'register'>('login');
  const [method, setMethod] = useState<'email' | 'phone'>('email');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmObj, setConfirmObj] = useState<any>(null);
  const [error, setError] = useState('');

  // CORRECCIÓN: Usar una referencia (ref) para el div de reCAPTCHA
  const recaptchaRef = useRef<HTMLDivElement>(null);

  // Efecto para inicializar reCAPTCHA al cargar
  useEffect(() => {
    // CORRECCIÓN: Pasar la referencia del elemento DOM directamente, sin timeout.
    if (recaptchaRef.current) {
      setupRecaptcha(recaptchaRef.current);
    }
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      if (authType === 'register') await registerWithEmail(email, password);
      else await loginWithEmail(email, password);
    } catch (err: any) { setError(err.message); }
  };

  const handleSms = async () => {
    setError('');
    try {
      const res = await loginWithPhone(phone);
      setConfirmObj(res);
    }
    catch (err: any) { setError(err.message); }
  };

  const handleOtp = async () => {
    setError('');
    try {
      await confirmObj.confirm(otp);
    } catch (err: any) {
      setError(err.message || "Código incorrecto");
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, #1a1a2e 0%, #000 100%)' }}>

      <h1 className="font-retro" style={{ fontSize: '3rem', color: '#e94560', textShadow: '4px 4px 0 #000', marginBottom: '20px' }}>
        unaBOMBER
      </h1>

      <div className="glass-panel animate-entry" style={{ width: '400px', maxWidth: '90%' }}>

        {/* HEADER: LOGIN vs REGISTRO */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px', paddingBottom: '10px' }}>
          <button
            onClick={() => setAuthType('login')}
            style={{
              flex: 1, background: 'none', border: 'none',
              color: authType === 'login' ? '#05d9e8' : '#666',
              fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem'
            }}>
            INICIAR SESIÓN
          </button>
          <button
            onClick={() => setAuthType('register')}
            style={{
              flex: 1, background: 'none', border: 'none',
              color: authType === 'register' ? '#ff2a6d' : '#666',
              fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem'
            }}>
            REGISTRARSE
          </button>
        </div>

        {/* PESTAÑAS: EMAIL vs TELÉFONO */}
        <div style={{ display: 'flex', marginBottom: '20px', gap: '10px' }}>
          <div onClick={() => setMethod('email')}
            style={{
              flex: 1, padding: '10px', textAlign: 'center', cursor: 'pointer',
              background: method === 'email' ? 'rgba(5, 217, 232, 0.1)' : 'transparent',
              border: method === 'email' ? '1px solid #05d9e8' : '1px solid #333',
              color: method === 'email' ? '#fff' : '#666', borderRadius: '4px'
            }}>
            ✉️ EMAIL
          </div>
          <div onClick={() => setMethod('phone')}
            style={{
              flex: 1, padding: '10px', textAlign: 'center', cursor: 'pointer',
              background: method === 'phone' ? 'rgba(5, 217, 232, 0.1)' : 'transparent',
              border: method === 'phone' ? '1px solid #05d9e8' : '1px solid #333',
              color: method === 'phone' ? '#fff' : '#666', borderRadius: '4px'
            }}>
            📱 TEL
          </div>
        </div>

        {error && <div style={{ color: '#ff4444', marginBottom: '15px', fontSize: '0.9rem', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '4px' }}>{error}</div>}

        {/* 1. EMAIL FORM */}
        {method === 'email' && (
          <form onSubmit={handleEmailAuth}>
            <input type="email" placeholder="Correo electrónico" className="cyber-input" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Contraseña" className="cyber-input" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" className="cyber-btn primary" style={{ marginTop: '10px' }}>
              {authType === 'login' ? 'ENTRAR CON EMAIL' : 'CREAR CUENTA'}
            </button>
          </form>
        )}

        {/* 2. PHONE FORM */}
        {method === 'phone' && (
          <div>
            {!confirmObj ? (
              <>
                <input type="tel" placeholder="+52 123 456 7890" className="cyber-input" value={phone} onChange={e => setPhone(e.target.value)} />
                <button onClick={handleSms} className="cyber-btn primary" id="sign-in-button">ENVIAR SMS</button>
              </>
            ) : (
              <>
                <input type="text" placeholder="Código 6 dígitos" className="cyber-input" value={otp} onChange={e => setOtp(e.target.value)} />
                <button onClick={handleOtp} className="cyber-btn primary">VERIFICAR CÓDIGO</button>
              </>
            )}
          </div>
        )}

        {/* SEPARADOR */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#666', fontSize: '0.8rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
          <span style={{ padding: '0 10px' }}>O CONTINÚA CON</span>
          <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
        </div>

        {/* 3. GOOGLE BUTTON */}
        <button onClick={loginWithGoogle} className="cyber-btn google" style={{ background: '#fff', color: '#333', borderColor: '#fff', marginBottom: '10px' }}>
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="20" alt="G" style={{ marginRight: '10px' }} />
          GOOGLE
        </button>

        {/* 4. ANONYMOUS BUTTON */}
        <button onClick={loginAnonymously} className="cyber-btn" style={{ borderColor: '#444', color: '#aaa', fontSize: '0.9rem', padding: '10px' }}>
          🕵️ JUGAR COMO INVITADO
        </button>

      </div>

      {/* RECAPTCHA: Usar la referencia */}
      <div id="recaptcha-container" ref={recaptchaRef} style={{ visibility: 'hidden', height: 0 }}></div>

    </div>
  );
};