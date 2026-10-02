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
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (installed || !deferredPrompt) return null;

  const install = async () => {
    if (busy || !deferredPrompt) return;

    setBusy(true);
    const promptEvent = deferredPrompt;
    setDeferredPrompt(null);

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'dismissed') setDeferredPrompt(promptEvent);
    } catch {
      setDeferredPrompt(promptEvent);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={install}
      disabled={busy}
      aria-label="تثبيت التطبيق"
      title="تثبيت التطبيق"
      className="fixed bottom-5 left-5 z-[55] flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black/85 text-white shadow-2xl backdrop-blur-md transition hover:scale-105 hover:bg-black disabled:opacity-60"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M12 7v7m0 0 3-3m-3 3-3-3" />
        <path d="M9 18h6" />
      </svg>
    </button>
  );
}
