import { Form, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { home } from '@/routes/practice';

type ResetProgressProps = {
    showSuccess?: boolean;
};

export default function ResetProgress({
    showSuccess = false,
}: ResetProgressProps) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const [resetOpen, setResetOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(showSuccess);

    useEffect(() => {
        setSuccessOpen(showSuccess);
    }, [showSuccess]);

    const returnToHome = () => {
        setSuccessOpen(false);
        router.visit(home());
    };

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Reset Progres Praktik"
                description="Hapus seluruh data latihan Anda tanpa menghapus akun"
            />
            <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-200/10 dark:bg-amber-700/10">
                <div className="space-y-0.5 text-amber-700 dark:text-amber-100">
                    <p className="font-medium">Peringatan</p>
                    <p className="text-sm">
                        Semua data barang, transaksi, pengiriman, dan riwayat
                        praktik akan dihapus permanen. Akun dan keanggotaan
                        kelas tetap dipertahankan.
                    </p>
                </div>

                <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="reset-progress-button"
                        >
                            Reset Progres
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>
                            Reset seluruh progres praktik?
                        </DialogTitle>
                        <DialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Masukkan kata
                            sandi untuk mengonfirmasi penghapusan seluruh data
                            latihan Anda.
                        </DialogDescription>

                        <Form
                            {...ProfileController.resetProgress.form()}
                            options={{ preserveScroll: true }}
                            onError={() => passwordInput.current?.focus()}
                            onSuccess={() => {
                                setResetOpen(false);
                                setSuccessOpen(true);
                            }}
                            resetOnSuccess
                            className="space-y-6"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="reset-progress-password"
                                            className="sr-only"
                                        >
                                            Kata Sandi
                                        </Label>
                                        <PasswordInput
                                            id="reset-progress-password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder="Masukkan kata sandi Anda"
                                            autoComplete="current-password"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button
                                                variant="secondary"
                                                onClick={() =>
                                                    resetAndClearErrors()
                                                }
                                            >
                                                Batal
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            variant="destructive"
                                            type="submit"
                                            disabled={processing}
                                            data-test="confirm-reset-progress-button"
                                        >
                                            Ya, Reset Progres
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <Dialog
                open={successOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        returnToHome();
                    }
                }}
            >
                <DialogContent>
                    <DialogTitle>Progres berhasil direset</DialogTitle>
                    <DialogDescription>
                        Semua data latihan Anda sudah dihapus. Akun dan
                        keanggotaan kelas tetap tersimpan.
                    </DialogDescription>
                    <DialogFooter>
                        <Button type="button" onClick={returnToHome}>
                            Kembali ke Beranda
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
