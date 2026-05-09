import { Sparkles } from 'lucide-react';

const COPY = {
  title: '\u0421\u0430\u043d\u0441\u0440\u044b\u043d \u044d\u043d\u0435\u0440\u0433\u0438 \u0446\u044d\u043d\u044d\u0433 \u0430\u0432\u0447 \u0431\u0430\u0439\u043d\u0430',
  body: '\u04e8\u043d\u04e9\u04e9\u0434\u0440\u0438\u0439\u043d \u043c\u044d\u0434\u044d\u044d\u043b\u043b\u0438\u0439\u043d \u0443\u0440\u0441\u0433\u0430\u043b \u0442\u04af\u0440 \u0437\u0430\u0432\u0441\u0430\u0440\u043b\u0430\u043b\u0430\u0430. \u0425\u044d\u0441\u044d\u0433 \u0445\u04af\u043b\u044d\u044d\u0433\u044d\u044d\u0434 \u0434\u0430\u0445\u0438\u043d \u043e\u0440\u043e\u043b\u0434\u043e\u043d\u043e \u0443\u0443.',
  retry: '\u0414\u0430\u0445\u0438\u043d \u043e\u0440\u043e\u043b\u0434\u043e\u0445',
};

export default function MobileQuotaError({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  if (error !== 'QUOTA_EXCEEDED') return null;

  return (
    <div className="glass-card my-5 border-indigo-500/30 bg-indigo-500/5 p-5 text-center">
      <Sparkles className="mx-auto mb-3 h-8 w-8 text-astra-gold" />
      <h3 className="mb-2 font-serif text-xl text-white">{COPY.title}</h3>
      <p className="mx-auto mb-4 max-w-sm text-sm leading-relaxed text-slate-400">{COPY.body}</p>
      <button onClick={onRetry} className="rounded-xl bg-indigo-600 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white">
        {COPY.retry}
      </button>
    </div>
  );
}
