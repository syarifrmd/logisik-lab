import { Form, usePage } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';
import ClassroomSelect from '@/components/classroom-select';
import InputError from '@/components/input-error';
import { join } from '@/routes/practice/classroom';
import type { Classroom } from '@/types/classroom';

export default function StudentClassroomCard({
    classrooms,
}: {
    classrooms: Classroom[];
}) {
    const { auth } = usePage().props;
    const classroom = auth.user.classroom;
    return (
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
                <GraduationCap className="mt-0.5 size-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold">
                        {classroom ? classroom.name : 'Bergabung dengan Kelas'}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {classroom
                            ? `${classroom.academic_year} · ${classroom.code}. Guru kelas dapat memantau hasil praktikmu.`
                            : 'Pilih kelas dari guru agar hasil praktik dan progresmu dapat dipantau.'}
                    </p>
                </div>
            </div>
            {!classroom && (
                <Form
                    {...join.form()}
                    options={{ preserveScroll: true }}
                    className="mt-4 space-y-3"
                >
                    {({ errors, processing }) => (
                        <>
                            <label htmlFor="classroom_id" className="sr-only">
                                Pilih kelas
                            </label>
                            <ClassroomSelect classrooms={classrooms} required />
                            <InputError message={errors.classroom_id} />
                            {classrooms.length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Belum ada kelas yang dibuka. Kamu tetap
                                    dapat berlatih sambil menunggu kelas dari
                                    guru.
                                </p>
                            )}
                            <button
                                disabled={processing || classrooms.length === 0}
                                className="min-h-11 w-full rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                            >
                                Gabung Kelas
                            </button>
                        </>
                    )}
                </Form>
            )}
        </section>
    );
}
