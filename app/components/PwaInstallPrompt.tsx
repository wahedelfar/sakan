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
    if (busy) return;
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
    <button
      type="button"
      onClick={install}
      disabled={busy}
      aria-label="تثبيت التطبيق"
      className="fixed bottom-5 right-5 z-[55] rounded-2xl border border-[var(--brand-primary)]/60 bg-black/80 px-5 py-3 text-sm font-bold text-white shadow-2xl backdrop-blur-md transition hover:bg-black disabled:opacity-60"
    >
      {busy ? 'جارٍ التثبيت...' : 'تثبيت التطبيق'}
    </button>
  );
}
