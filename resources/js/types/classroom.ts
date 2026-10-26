export type Classroom = {
    id: number;
    name: string;
    academic_year: string;
    code: string;
    is_active: boolean;
    teacher?: { id: number; name: string } | null;
    students_count?: number;
    active_students_count?: number;
};

export type StudentProgress = {
    product_count: number;
    inbound_count: number;
    outbound_count: number;
    shipment_count: number;
    received_count: number;
    stock_good: number;
    stock_damaged: number;
    completed_steps: number;
    total_steps: number;
    percentage: number;
    last_activity_at: string | null;
};

export type StudentSummary = {
    id: number;
    name: string;
    email: string;
    progress: StudentProgress;
};

export type { Paginated as PageData } from './models';
