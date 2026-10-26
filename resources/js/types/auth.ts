export type User = {
    id: number;
    name: string;
    email: string;
    role: 'student' | 'admin';
    classroom_id: number | null;
    classroom: {
        id: number;
        name: string;
        academic_year: string;
        code: string;
    } | null;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};
