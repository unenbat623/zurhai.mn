import { CheckCircle2, Database, Download, Plus, Search, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import type React from 'react';
import type { AppUser } from '../frontendTypes';
import { SIGN_NAMES_MN, ZODIAC_SIGNS, type UserProfile, type ZodiacSign } from '../types';

interface Props {
  activeProfile: UserProfile | null;
  users: AppUser[];
  onAddUser: (profile: UserProfile) => void;
  onDeleteUser: (id: string) => void;
  onSelectUser: (id: string) => void;
}

const emptyForm: UserProfile = {
  name: '',
  birthDate: '',
  birthTime: '12:00',
  birthLocation: 'Ulaanbaatar, Mongolia',
  sunSign: 'Aries',
};

export default function AdminUsersView({ activeProfile, onAddUser, onDeleteUser, onSelectUser, users }: Props) {
  const [form, setForm] = useState<UserProfile>(emptyForm);
  const [query, setQuery] = useState('');
  const canSubmit = form.name.trim().length >= 2 && !!form.birthDate && !!form.sunSign;
  const activeUser = users.find(user => isActive(user, activeProfile));

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;
    return users.filter(user => `${user.name} ${user.birthDate} ${user.birthLocation} ${SIGN_NAMES_MN[user.sunSign]}`.toLowerCase().includes(term));
  }, [query, users]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onAddUser({ ...form, name: form.name.trim() });
    setForm(emptyForm);
  };

  const exportUsers = () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), users }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `astra-users-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/10 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-200">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-indigo-300">Private Admin Console</p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-white md:text-4xl">Хэрэглэгчийн удирдлага</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
              Энэ хэсэг public navigation дээр харагдахгүй. Шууд admin холбоосоор орж хэрэглэгч нэмэх, сонгох, устгах, хайх, export хийх боломжтой.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Metric icon={<UserRound size={16} />} label="Нийт хэрэглэгч" value={users.length.toString()} />
        <Metric icon={<CheckCircle2 size={16} />} label="Идэвхтэй" value={activeUser?.name || 'Сонгоогүй'} />
        <Metric icon={<Database size={16} />} label="Storage" value="Local" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={submit} className="glass-card h-fit border-white/10 bg-slate-900/40 p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
              <Plus size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white">Шинэ хэрэглэгч</h3>
              <p className="text-xs text-slate-500">Профайл үүсгээд app-д сонгоно.</p>
            </div>
          </div>

          <div className="space-y-4">
            <Field label="Нэр">
              <input value={form.name} onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))} className="admin-input" placeholder="Жишээ: Анужин" />
            </Field>
            <Field label="Төрсөн огноо">
              <input type="date" value={form.birthDate} onChange={event => setForm(prev => ({ ...prev, birthDate: event.target.value }))} className="admin-input" />
            </Field>
            <Field label="Төрсөн цаг">
              <input type="time" value={form.birthTime} onChange={event => setForm(prev => ({ ...prev, birthTime: event.target.value }))} className="admin-input" />
            </Field>
            <Field label="Төрсөн газар">
              <input value={form.birthLocation} onChange={event => setForm(prev => ({ ...prev, birthLocation: event.target.value }))} className="admin-input" />
            </Field>
            <Field label="Орд">
              <select value={form.sunSign} onChange={event => setForm(prev => ({ ...prev, sunSign: event.target.value as ZodiacSign }))} className="admin-input">
                {ZODIAC_SIGNS.map(sign => <option key={sign} value={sign}>{SIGN_NAMES_MN[sign]}</option>)}
              </select>
            </Field>
          </div>

          <button disabled={!canSubmit} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500">
            <Plus size={15} />
            Нэмэх
          </button>
        </form>

        <div className="space-y-4">
          <div className="glass-card flex flex-col gap-3 border-white/10 bg-slate-900/40 p-4 sm:flex-row">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input value={query} onChange={event => setQuery(event.target.value)} className="admin-input pl-9" placeholder="Хэрэглэгч хайх..." />
            </label>
            <button onClick={exportUsers} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-white/10">
              <Download size={15} />
              Export
            </button>
          </div>

          {filteredUsers.length === 0 && (
            <div className="glass-card border-white/10 bg-slate-900/40 p-8 text-center">
              <UserRound className="mx-auto mb-4 text-slate-500" />
              <p className="text-sm text-slate-400">Хэрэглэгч олдсонгүй.</p>
            </div>
          )}

          {filteredUsers.map(user => (
            <article key={user.id} className="glass-card flex flex-col gap-4 border-white/10 bg-slate-900/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <button onClick={() => onSelectUser(user.id)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-sm font-black text-white">
                  {user.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-bold text-white">{user.name}</h3>
                    {isActive(user, activeProfile) && <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {SIGN_NAMES_MN[user.sunSign]} • {user.birthDate} • {user.birthLocation || 'Байршилгүй'}
                  </p>
                </div>
              </button>
              <button onClick={() => onDeleteUser(user.id)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 transition-colors hover:bg-rose-500 hover:text-white" aria-label={`${user.name} устгах`}>
                <Trash2 size={16} />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 text-indigo-300">{icon}</div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 truncate text-lg font-black text-white">{value}</p>
    </div>
  );
}

function isActive(user: AppUser, profile: UserProfile | null) {
  return !!profile && user.name === profile.name && user.birthDate === profile.birthDate && user.sunSign === profile.sunSign;
}
