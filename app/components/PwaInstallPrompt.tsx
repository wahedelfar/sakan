'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (standalone) {
      setInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setShowHelp(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (installed) return null;

  const install = async () => {
    if (busy) return;

    if (!deferredPrompt) {
      setShowHelp(true);
      return;
    }

    setBusy(true);
    const promptEvent = deferredPrompt;
    setDeferredPrompt(null);

    try {
      await promptEvent.prompt();
      await promptEvent.userChoice;
    } catch {
      setDeferredPrompt(promptEvent);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={install}
        disabled={busy}
        aria-label="تثبيت التطبيق"
        title="تثبيت التطبيق"
        className="fixed bottom-5 right-5 z-[55] flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black/85 text-white shadow-2xl backdrop-blur-md transition hover:scale-105 hover:bg-black disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M12 7v7m0 0 3-3m-3 3-3-3" />
          <path d="M9 18h6" />
        </svg>
      </button>

      {showHelp && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-4 sm:items-center" onClick={() => setShowHelp(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="تثبيت التطبيق"
            className="w-full max-w-sm rounded-3xl border border-white/15 bg-white p-5 text-right shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="5" y="3" width="14" height="18" rx="2" />
                  <path d="M12 7v7m0 0 3-3m-3 3-3-3" />
                  <path d="M9 18h6" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">تثبيت التطبيق</h2>
                <p className="text-xs text-slate-500">التثبيت متاح من قائمة المتصفح</p>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-700">
              إذا لم تظهر نافذة التثبيت تلقائيًا، افتح قائمة المتصفح ⋮ ثم اختر <strong>تثبيت التطبيق</strong> أو <strong>إضافة إلى الشاشة الرئيسية</strong>.
            </p>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
            >
              فهمت
            </button>
          </div>
        </div>
      )}
    </>
  );
}
