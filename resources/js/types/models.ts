export type Product = {
    id: number;
    workspace_id: number;
    code: string;
    name: string;
    category: string;
    specification: string | null;
    photo_path: string | null;
    photo_url?: string | null;
    base_unit: string;
    cost_price: string;
    selling_price: string;
    stock_good: number;
    stock_damaged: number;
    archived_at: string | null;
    created_at: string;
    updated_at: string;
    // computed
    stock_physical?: number;
    is_active?: boolean;
    stock_transactions_exists?: boolean;
};

export type StockTransaction = {
    id: number;
    workspace_id: number;
    product_id: number;
    transaction_number: string;
    type: 'opening' | 'inbound' | 'outbound';
    transaction_date: string;
    external_document_number: string | null;
    supplier: string | null;
    recipient: string | null;
    reason: 'sale' | 'usage' | 'return' | null;
    storage_location: string | null;
    stock_condition: 'good' | 'damaged';
    quantity: number;
    unit_price: string;
    total_amount: string;
    notes: string | null;
    voided_at: string | null;
    void_reason: string | null;
    created_at: string;
    updated_at: string;
    product?: Pick<Product, 'id' | 'code' | 'name' | 'base_unit' | 'category' | 'specification'>;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export type ShipmentItem = {
    id: number;
    shipment_id: number;
    stock_transaction_id: number | null;
    product_id: number | null;
    product_code_snapshot: string;
    product_name_snapshot: string;
    category_snapshot: string;
    base_unit_snapshot: string;
    stock_condition: 'good' | 'damaged';
    quantity: number;
    stock_transaction?: StockTransaction;
};

export type ShipmentDocument = {
    id: number;
    shipment_id: number;
    document_type: string;
    document_number: string;
    document_date: string | null;
    notes: string | null;
    attachment_path: string | null;
    attachment_name: string | null;
    created_at: string;
};

export type ShipmentStatusHistory = {
    id: number;
    shipment_id: number;
    from_status: string | null;
    to_status: string;
    notes: string | null;
    created_at: string;
};

export type Shipment = {
    id: number;
    workspace_id: number;
    shipment_number: string;
    shipment_type: 'domestic' | 'export' | 'import';
    origin: string;
    destination: string;
    origin_country: string;
    destination_country: string;
    incoterms: string | null;
    customs_document_type: string | null;
    customs_document_number: string | null;
    tariffs_and_taxes: string;
    transport_mode: 'land' | 'sea' | 'air';
    fleet_type: string;
    driver_name: string | null;
    carrier_service: string | null;
    tracking_number: string | null;
    mode_selection_reason: string;
    estimated_cost: string;
    cargo_type: 'general' | 'fragile' | 'liquid' | 'perishable' | 'other';
    cargo_type_details: string | null;
    total_weight_kg: string;
    volume_m3: string | null;
    packaging_type: 'box' | 'pallet' | 'crate' | 'container' | 'other';
    packaging_type_details: string | null;
    handling_instructions: string;
    special_notes: string | null;
    shipping_date: string;
    estimated_arrival_date: string;
    received_date: string | null;
    status: 'scheduled' | 'shipped' | 'in_transit' | 'received' | 'cancelled';
    cancellation_reason: string | null;
    cancelled_at: string | null;
    created_at: string;
    updated_at: string;
    items?: ShipmentItem[];
    documents?: ShipmentDocument[];
    status_histories?: ShipmentStatusHistory[];
};
