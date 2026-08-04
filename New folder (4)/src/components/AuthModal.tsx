import React, { useState } from 'react';
import { X, Lock, Mail, User, MapPin, Phone, Globe, ShieldCheck, ArrowRight } from 'lucide-react';
import { Language, UserProfile } from '../types';
import { getTranslation } from '../i18n/translations';
import { COUNTRIES } from '../lib/countries';
import { registerUserInFirebase, signInUserInFirebase } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSuccess: (user: UserProfile, isNewRegistration: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Registration state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0].name);
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');

  // Country search state
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  if (!isOpen) return null;

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!fullName.trim() || !email.trim() || !password || !city.trim()) {
          setErrorMsg('Please fill in all required fields.');
          setLoading(false);
          return;
        }

        const newUser = await registerUserInFirebase({
          fullName,
          email,
          password,
          country: selectedCountry,
          city,
          phone,
        });

        onSuccess(newUser, true);
      } else {
        if (!email.trim() || !password) {
          setErrorMsg('Please enter email and password.');
          setLoading(false);
          return;
        }

        const loggedInUser = await signInUserInFirebase(email, password);
        onSuccess(loggedInUser, false);
      }
    } catch (err: any) {
      console.error('Auth Submit Error:', err);
      let msg = err.message || 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email address is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email or password.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0c0d14] border border-white/15 rounded-[32px] sm:rounded-[40px] shadow-2xl p-6 sm:p-8 my-8 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-blue-600 mb-3 shadow-lg border border-white/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {mode === 'register'
              ? getTranslation(language, 'createAccount')
              : getTranslation(language, 'signInTitle')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            RYNEXO Security & Firebase Auth Protected
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-full bg-white/5 p-1 border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-full transition ${
              mode === 'register'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-full transition ${
              mode === 'login'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {getTranslation(language, 'fullName')} *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alexander Vance"
                  className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {getTranslation(language, 'email')} *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {getTranslation(language, 'password')} *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              {/* Country Picker */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {getTranslation(language, 'country')} *
                </label>
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span>{selectedCountry}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Change</span>
                </button>

                {showCountryDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-[#0c0d14] border border-white/20 rounded-2xl p-2 z-50 shadow-2xl">
                    <input
                      type="text"
                      placeholder="Search country..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="w-full mb-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white"
                    />
                    {filteredCountries.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(c.name);
                          setShowCountryDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white rounded-lg flex items-center justify-between"
                      >
                        <span>{c.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{c.dialCode}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {getTranslation(language, 'city')} *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Dubai, Paris, Casablanca, London"
                    className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* Phone Optional */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {getTranslation(language, 'phoneOptional')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 mt-2 rounded-full bg-white text-black font-bold text-xs tracking-wide shadow-xl hover:bg-slate-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>
                {mode === 'register'
                  ? getTranslation(language, 'registering')
                  : getTranslation(language, 'signingIn')}
              </span>
            ) : (
              <>
                <span>
                  {mode === 'register'
                    ? getTranslation(language, 'signUpButton')
                    : getTranslation(language, 'signInButton')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Footer */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'register' ? 'login' : 'register');
              setErrorMsg(null);
            }}
            className="text-xs text-purple-300 hover:text-white transition underline underline-offset-4 font-medium"
          >
            {mode === 'register'
              ? getTranslation(language, 'alreadyHaveAccount')
              : getTranslation(language, 'dontHaveAccount')}
          </button>
        </div>
      </div>
    </div>
  );
};
