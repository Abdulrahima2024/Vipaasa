-- Reset public schema for a clean install on Neon
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Sequences for Document Numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq;
CREATE SEQUENCE IF NOT EXISTS quotation_number_seq;
CREATE SEQUENCE IF NOT EXISTS refund_number_seq;
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq;

-- Custom Case-Sensitive Enum Types (matching Prisma)
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE "AddressType" AS ENUM ('BILLING', 'SHIPPING', 'HOME', 'WORK');
CREATE TYPE "SkuStatus" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED');
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FLAT');
CREATE TYPE "TransactionType" AS ENUM ('INBOUND', 'OUTBOUND', 'ADJUSTMENT', 'RESERVATION_FULFILLED');
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'FULFILLED', 'EXPIRED', 'CANCELLED');
CREATE TYPE "AdjustmentReason" AS ENUM ('DAMAGED', 'THEFT', 'AUDIT_CORRECTION', 'EXPIRED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED');
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED');
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED');
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'UPI', 'NET_BANKING', 'COD', 'WALLET');
CREATE TYPE "PaymentStatusDetail" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE "TransactionActionType" AS ENUM ('CAPTURE', 'AUTHORIZE', 'REFUND', 'VOID');
CREATE TYPE "TransactionStatus" AS ENUM ('SUCCESS', 'FAILED');
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');
CREATE TYPE "QuotationStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CONVERTED_TO_ORDER', 'EXPIRED');
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "NotificationType" AS ENUM ('ORDER_STATUS', 'PROMOTION', 'SYSTEM', 'TICKET_UPDATE');
CREATE TYPE "DeliveryChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH');
CREATE TYPE "DeliveryState" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- Tables

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT role_permissions_unique UNIQUE (role_id, permission_id)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    status "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX users_email_active_idx ON users(email) WHERE is_deleted = FALSE;
CREATE UNIQUE INDEX users_phone_active_idx ON users(phone_number) WHERE is_deleted = FALSE AND phone_number IS NOT NULL;
CREATE INDEX users_role_id_idx ON users(role_id);
CREATE INDEX users_status_idx ON users(status);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(500) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX refresh_tokens_user_id_idx ON refresh_tokens(user_id);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_active_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX user_sessions_is_active_idx ON user_sessions(is_active);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX audit_logs_entity_idx ON audit_logs(entity_name, entity_id);
CREATE INDEX audit_logs_user_id_idx ON audit_logs(user_id);

CREATE TABLE customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    address_type "AddressType" NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX customer_addresses_profile_id_idx ON customer_addresses(profile_id);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX categories_parent_id_idx ON categories(parent_id);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX products_slug_active_idx ON products(slug) WHERE is_deleted = FALSE;
CREATE INDEX products_category_id_idx ON products(category_id);
CREATE INDEX products_fts_idx ON products USING GIN (to_tsvector('english', name || ' ' || description));

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text VARCHAR(255),
    sort_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX product_images_product_id_idx ON product_images(product_id);

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    weight_grams INT NOT NULL,
    sku_status "SkuStatus" NOT NULL DEFAULT 'IN_STOCK',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX product_variants_product_id_idx ON product_variants(product_id);

CREATE TABLE product_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID UNIQUE NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    base_price DECIMAL(10, 2) NOT NULL CHECK (base_price > 0),
    compare_at_price DECIMAL(10, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type "DiscountType" NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (end_date > start_date)
);

CREATE TABLE variant_discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    discount_id UUID NOT NULL REFERENCES product_discounts(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT variant_discounts_unique UNIQUE (variant_id, discount_id)
);

CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity_on_hand INT NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    quantity_reserved INT NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
    reorder_level INT NOT NULL DEFAULT 10 CHECK (reorder_level >= 0),
    version INT NOT NULL DEFAULT 1 CHECK (version >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT inventory_warehouse_variant_unique UNIQUE (warehouse_id, variant_id),
    CONSTRAINT inventory_qty_check CHECK (quantity_on_hand >= quantity_reserved)
);

CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
    transaction_type "TransactionType" NOT NULL,
    quantity INT NOT NULL,
    reference_type VARCHAR(100) NOT NULL,
    reference_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX inventory_transactions_inventory_id_idx ON inventory_transactions(inventory_id);
CREATE INDEX inventory_transactions_ref_idx ON inventory_transactions(reference_type, reference_id);

CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cart_owner_check CHECK (user_id IS NOT NULL OR session_token IS NOT NULL)
);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cart_variant_unique UNIQUE (cart_id, variant_id)
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(100) UNIQUE NOT NULL DEFAULT ('ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::text, 6, '0')),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    executive_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    status "OrderStatus" NOT NULL DEFAULT 'PENDING',
    total_items_price DECIMAL(10, 2) NOT NULL CHECK (total_items_price >= 0),
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    tax_amount DECIMAL(10, 2) NOT NULL CHECK (tax_amount >= 0),
    shipping_fee DECIMAL(10, 2) NOT NULL CHECK (shipping_fee >= 0),
    total_payable DECIMAL(10, 2) NOT NULL CHECK (total_payable >= 0),
    shipping_address_line1 TEXT NOT NULL,
    shipping_address_line2 TEXT,
    shipping_city VARCHAR(255) NOT NULL,
    shipping_state VARCHAR(255) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(100) NOT NULL,
    billing_address_line1 TEXT NOT NULL,
    billing_address_line2 TEXT,
    billing_city VARCHAR(255) NOT NULL,
    billing_state VARCHAR(255) NOT NULL,
    billing_postal_code VARCHAR(20) NOT NULL,
    billing_country VARCHAR(100) NOT NULL,
    payment_status "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    delivery_status "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX orders_user_id_idx ON orders(user_id);
CREATE INDEX orders_executive_id_idx ON orders(executive_id);
CREATE INDEX orders_status_idx ON orders(status);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT order_item_variant_unique UNIQUE (order_id, variant_id)
);

CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status "OrderStatus" NOT NULL,
    changed_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX order_status_history_order_id_idx ON order_status_history(order_id);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    invoice_number VARCHAR(100) UNIQUE NOT NULL DEFAULT ('INV-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('invoice_number_seq')::text, 6, '0')),
    invoice_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pdf_url TEXT,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    cart_item_id UUID REFERENCES cart_items(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    expires_at TIMESTAMP NOT NULL,
    status "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX stock_reservations_inventory_id_idx ON stock_reservations(inventory_id);
CREATE INDEX stock_reservations_expires_at_idx ON stock_reservations(expires_at);

CREATE TABLE stock_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
    adjusted_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    quantity_change INT NOT NULL,
    reason "AdjustmentReason" NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX stock_adjustments_inventory_id_idx ON stock_adjustments(inventory_id);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    payment_method "PaymentMethod" NOT NULL,
    payment_status "PaymentStatusDetail" NOT NULL DEFAULT 'PENDING',
    transaction_reference VARCHAR(255) UNIQUE,
    gateway_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    gateway_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX payments_order_id_idx ON payments(order_id);
CREATE INDEX payments_user_id_idx ON payments(user_id);
CREATE INDEX payments_intent_idx ON payments(gateway_payment_intent_id);

CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    action_type "TransactionActionType" NOT NULL,
    status "TransactionStatus" NOT NULL,
    raw_response JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX payment_transactions_payment_id_idx ON payment_transactions(payment_id);

CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    refund_number VARCHAR(100) UNIQUE NOT NULL DEFAULT ('REF-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(nextval('refund_number_seq')::text, 6, '0')),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    status "RefundStatus" NOT NULL DEFAULT 'PENDING',
    gateway_refund_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX refunds_payment_id_idx ON refunds(payment_id);

CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number VARCHAR(100) UNIQUE NOT NULL DEFAULT ('QTN-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(nextval('quotation_number_seq')::text, 6, '0')),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    executive_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status "QuotationStatus" NOT NULL DEFAULT 'DRAFT',
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    valid_until TIMESTAMP NOT NULL,
    approved_by_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX quotations_user_id_idx ON quotations(user_id);
CREATE INDEX quotations_executive_id_idx ON quotations(executive_id);

CREATE TABLE quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT quotation_items_unique UNIQUE (quotation_id, variant_id)
);

CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    carrier_name VARCHAR(255) NOT NULL,
    tracking_number VARCHAR(255) UNIQUE,
    delivery_status "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    estimated_delivery TIMESTAMP,
    actual_delivery TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE delivery_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    status VARCHAR(100) NOT NULL,
    location TEXT,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    remarks TEXT,
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX delivery_tracking_delivery_id_idx ON delivery_tracking(delivery_id);

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_executive_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ticket_number VARCHAR(100) UNIQUE NOT NULL DEFAULT ('TCK-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(nextval('ticket_number_seq')::text, 6, '0')),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status "TicketStatus" NOT NULL DEFAULT 'OPEN',
    priority "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX tickets_user_id_idx ON tickets(user_id);
CREATE INDEX tickets_assigned_executive_idx ON tickets(assigned_executive_id);

CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ticket_messages_ticket_id_idx ON ticket_messages(ticket_id);

CREATE TABLE ticket_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES ticket_messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ticket_attachments_message_id_idx ON ticket_attachments(message_id);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    notification_type "NotificationType" NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_is_read_idx ON notifications(is_read);

CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
    channel "DeliveryChannel" NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    delivery_status "DeliveryState" NOT NULL DEFAULT 'PENDING',
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX notification_logs_notification_id_idx ON notification_logs(notification_id);

CREATE TABLE report_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    snapshot_date DATE NOT NULL,
    data JSONB NOT NULL,
    generated_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX report_snapshots_date_idx ON report_snapshots(snapshot_date);
CREATE INDEX report_snapshots_type_idx ON report_snapshots(report_type);

CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX activity_logs_user_id_idx ON activity_logs(user_id);


-- SECURITY & CONSISTENCY DATABASE TRIGGERS --

CREATE OR REPLACE FUNCTION clean_user_sessions_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.is_deleted = TRUE) OR (NEW.status IN ('INACTIVE', 'SUSPENDED')) THEN
        DELETE FROM refresh_tokens WHERE user_id = NEW.id;
        DELETE FROM user_sessions WHERE user_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_status_session_cleanup_trigger
    AFTER UPDATE OF is_deleted, status ON users
    FOR EACH ROW
    EXECUTE FUNCTION clean_user_sessions_on_status_change();


CREATE OR REPLACE FUNCTION audit_sensitive_changes()
RETURNS TRIGGER AS $$
DECLARE
    entity_id_val VARCHAR(100);
    old_json JSONB := NULL;
    new_json JSONB := NULL;
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        old_json := to_jsonb(OLD);
        new_json := to_jsonb(NEW);
        entity_id_val := OLD.id::text;
    ELSIF (TG_OP = 'INSERT') THEN
        new_json := to_jsonb(NEW);
        entity_id_val := NEW.id::text;
    ELSIF (TG_OP = 'DELETE') THEN
        old_json := to_jsonb(OLD);
        entity_id_val := OLD.id::text;
    END IF;

    INSERT INTO audit_logs (action, entity_name, entity_id, old_values, new_values)
    VALUES (TG_OP, TG_TABLE_NAME, entity_id_val, old_json, new_json);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_pricing_trigger
    AFTER INSERT OR UPDATE OR DELETE ON product_pricing
    FOR EACH ROW EXECUTE FUNCTION audit_sensitive_changes();

CREATE TRIGGER audit_role_permissions_trigger
    AFTER INSERT OR DELETE ON role_permissions
    FOR EACH ROW EXECUTE FUNCTION audit_sensitive_changes();
