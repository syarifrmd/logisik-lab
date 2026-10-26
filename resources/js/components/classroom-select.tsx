import type { Classroom } from '@/types/classroom';

export default function ClassroomSelect({
    classrooms,
    allowUnassigned = false,
    required = false,
    defaultValue = '',
}: {
    classrooms: Classroom[];
    allowUnassigned?: boolean;
    required?: boolean;
    defaultValue?: string;
}) {
    return (
        <select
            id="classroom_id"
            name="classroom_id"
            defaultValue={defaultValue}
            required={required}
            className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
        >
            <option value="">
                {allowUnassigned
                    ? 'Akun lama / belum bergabung kelas'
                    : 'Pilih kelas dari guru'}
            </option>
            {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                    {classroom.name} · {classroom.academic_year} ·{' '}
                    {classroom.teacher?.name ?? classroom.code}
                    {classroom.is_active === false
                        ? ' (pendaftaran ditutup)'
                        : ''}
                </option>
            ))}
        </select>
    );
}
