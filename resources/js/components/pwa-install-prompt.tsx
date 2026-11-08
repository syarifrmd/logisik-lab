import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function PwaInstallPrompt() {
    const [installEvent, setInstallEvent] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setInstallEvent(event as BeforeInstallPromptEvent);
            setVisible(true);
        };

        window.addEventListener(
            'beforeinstallprompt',
            handleBeforeInstallPrompt,
        );

        return () =>
            window.removeEventListener(
                'beforeinstallprompt',
                handleBeforeInstallPrompt,
            );
    }, []);

    if (!visible || !installEvent) {
        return null;
    }

    async function install() {
        await installEvent?.prompt();
        await installEvent?.userChoice;
        setInstallEvent(null);
        setVisible(false);
    }

    return (
        <div className="fixed inset-x-4 bottom-20 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-primary/20 bg-card p-3 text-card-foreground shadow-lg lg:bottom-4">
            <img
                src="/images/logo.png"
                alt=""
                className="size-10 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Pasang AS LogiEdu</p>
                <p className="text-xs text-muted-foreground">
                    Buka lebih cepat seperti aplikasi biasa.
                </p>
            </div>
            <button
                type="button"
                onClick={install}
                className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
            >
                Pasang
            </button>
            <button
                type="button"
                onClick={() => setVisible(false)}
                className="rounded-lg px-2 py-2 text-xs text-muted-foreground"
            >
                Nanti
            </button>
        </div>
    );
}
