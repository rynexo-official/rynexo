import React, { useState } from 'react';
import { User, Globe, Crown, Bell, Lock, LogOut, Check, Save, MapPin, Phone, Mail, Award, DollarSign, ShieldCheck } from 'lucide-react';
import { Language, UserProfile } from '../types';
import { getTranslation } from '../i18n/translations';
import { updateUserProfileInFirestore } from '../lib/firebase';
import { COUNTRIES } from '../lib/countries';

interface ProfileViewProps {
  user: UserProfile | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onSignOut: () => void;
  onUpdateUser: (updated: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  language,
  onLanguageChange,
  onSignOut,
  onUpdateUser,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [country, setCountry] = useState(user?.country || 'United States');
  const [city, setCity] = useState(user?.city || 'New York');
  const [profession, setProfession] = useState(user?.profession || '');
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  const [languagesStr, setLanguagesStr] = useState(user?.languages?.join(', ') || 'English, French');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'intermediate');
  const [availableBudget, setAvailableBudget] = useState(user?.availableBudgetUSD || 250);
  const [careerGoal, setCareerGoal] = useState(user?.careerGoal || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [monthlyGoal, setMonthlyGoal] = useState(user?.monthlyGoalUSD || 5000);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const languagesArray = languagesStr.split(',').map((l) => l.trim()).filter(Boolean);

      const updated = await updateUserProfileInFirestore(
        {
          fullName,
          country,
          city,
          profession,
          skills: skillsArray,
          languages: languagesArray,
          experienceLevel: experienceLevel as any,
          experience: experienceLevel,
          availableBudgetUSD: Number(availableBudget),
          budget: Number(availableBudget),
          careerGoal,
          careerGoals: careerGoal ? [careerGoal] : [],
          phone,
          monthlyGoalUSD: Number(monthlyGoal),
          incomeTarget: Number(monthlyGoal),
        },
        user.uid
      );

      onUpdateUser(updated);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save profile error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Profile Header Banner */}
      <div className="p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900/60 border border-white/10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white text-black font-bold text-2xl flex items-center justify-center shadow-xl uppercase shrink-0">
              {user ? user.fullName.charAt(0) : 'U'}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {user ? user.fullName : 'Guest User'}
                </h1>
                <span className="px-3 py-0.5 rounded-full bg-white/10 border border-white/20 text-purple-300 text-[10px] font-bold uppercase">
                  {user?.subscriptionTier || 'PRO'} TIER
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{user?.email}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {user?.city}, {user?.country}
              </p>
            </div>
          </div>

          <button
            onClick={onSignOut}
            className="px-5 py-2.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 font-bold text-xs hover:bg-rose-500 hover:text-white transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>{getTranslation(language, 'signOut')}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Language Switcher Section */}
      <div className="p-6 rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-3">
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <Globe className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
            {getTranslation(language, 'languageSelection')}
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          {[
            { code: 'en' as Language, label: 'English' },
            { code: 'fr' as Language, label: 'Français' },
            { code: 'ar' as Language, label: 'العربية' },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              className={`py-3 px-4 rounded-full font-bold transition flex items-center justify-center gap-2 ${
                language === lang.code
                  ? 'bg-white text-black shadow-lg'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
              }`}
            >
              <span>{lang.label}</span>
              {language === lang.code && <Check className="w-4 h-4 text-black" />}
            </button>
          ))}
        </div>
      </div>

      {/* Personal Details Form */}
      <div className="p-6 rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
              {getTranslation(language, 'personalInformation')}
            </h3>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs text-purple-300 hover:text-white font-bold"
          >
            {isEditing ? 'Cancel' : getTranslation(language, 'editProfile')}
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                {getTranslation(language, 'fullName')}
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                {getTranslation(language, 'email')}
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                {getTranslation(language, 'country')}
              </label>
              <select
                disabled={!isEditing}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-white/30"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name} className="bg-[#0c0d14] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                {getTranslation(language, 'city')}
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Profession / Current Role
              </label>
              <input
                type="text"
                disabled={!isEditing}
                placeholder="e.g. Graphic Designer, Accountant, Marketer"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Skills (Comma separated)
              </label>
              <input
                type="text"
                disabled={!isEditing}
                placeholder="e.g. Copywriting, Figma, React, Sales"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Languages Spoken (Comma separated)
              </label>
              <input
                type="text"
                disabled={!isEditing}
                placeholder="e.g. English, French, Arabic"
                value={languagesStr}
                onChange={(e) => setLanguagesStr(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Experience Level
              </label>
              <select
                disabled={!isEditing}
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-white/30 cursor-pointer"
              >
                <option value="beginner" className="bg-[#0c0d14] text-white">Beginner (0-1 yrs)</option>
                <option value="intermediate" className="bg-[#0c0d14] text-white">Intermediate (2-4 yrs)</option>
                <option value="advanced" className="bg-[#0c0d14] text-white">Advanced (5+ yrs)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Monthly Starting Budget ($ USD)
              </label>
              <input
                type="number"
                disabled={!isEditing}
                value={availableBudget}
                onChange={(e) => setAvailableBudget(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Career / Business Goal
              </label>
              <input
                type="text"
                disabled={!isEditing}
                placeholder="e.g. Transition to remote consulting or e-commerce"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                {getTranslation(language, 'phoneOptional')}
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                {getTranslation(language, 'monthlyTarget')} ($ USD)
              </label>
              <input
                type="number"
                disabled={!isEditing}
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {isEditing && (
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-full bg-white text-black font-bold text-xs hover:bg-slate-200 transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{getTranslation(language, 'saveChanges')}</span>
            </button>
          )}
        </form>
      </div>

      {/* Subscription Tier Info Card */}
      <div className="p-6 rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-sm">
              {getTranslation(language, 'proPlan')}
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-md leading-relaxed">
            Your account includes full access to Gemini 3.6 Flash career models, unlimited AI roadmaps, and global job placement matches.
          </p>
        </div>

        <span className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center">
          Active Subscription
        </span>
      </div>
    </div>
  );
};
