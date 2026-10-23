import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

export function useFlashToast(): void {
    const [flash, setFlash] = useState<FlashToast | undefined>();
    const lastToastRef = useRef<FlashToast | null>(null);

    useEffect(() => {
        return router.on('navigate', (event) => {
            setFlash(
                (event.detail.page.props as { flash?: { toast?: FlashToast } })
                    .flash?.toast,
            );
        });
    }, []);

    useEffect(() => {
        const data = flash;
        if (!data) return;

        // Prevent duplicate trigger if same instance
        if (lastToastRef.current === data) return;
        lastToastRef.current = data;

        if (data.type === 'success') {
            toast.success(data.message);
        } else if (data.type === 'error') {
            toast.error(data.message);
        } else if (data.type === 'warning') {
            toast.warning(data.message);
        } else {
            toast.info(data.message);
        }
    }, [flash]);
}
