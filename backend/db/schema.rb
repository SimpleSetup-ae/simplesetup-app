# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_09_17_131303) do
  create_schema "auth"
  create_schema "extensions"
  create_schema "graphql"
  create_schema "graphql_public"
  create_schema "pgbouncer"
  create_schema "realtime"
  create_schema "storage"
  create_schema "vault"

  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_graphql"
  enable_extension "pg_stat_statements"
  enable_extension "pgcrypto"
  enable_extension "plpgsql"
  enable_extension "supabase_vault"
  enable_extension "uuid-ossp"

  create_table "application_progress", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "company_id", null: false
    t.integer "step", default: 0, null: false
    t.integer "percent", default: 0, null: false
    t.datetime "last_activity_at", default: -> { "now()" }, null: false
    t.string "current_page"
    t.jsonb "page_data", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id"], name: "index_application_progress_on_company_id", unique: true
  end

  create_table "billing_accounts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "company_id", null: false
    t.string "stripe_customer_id"
    t.string "billing_email"
    t.jsonb "billing_address", default: {}
    t.string "default_payment_method_id"
    t.decimal "account_balance", precision: 10, scale: 2, default: "0.0"
    t.string "currency", default: "AED"
    t.jsonb "metadata", default: {}
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["billing_email"], name: "index_billing_accounts_on_billing_email"
    t.index ["company_id"], name: "index_billing_accounts_on_company_id"
    t.index ["deleted_at"], name: "index_billing_accounts_on_deleted_at"
    t.index ["stripe_customer_id"], name: "index_billing_accounts_on_stripe_customer_id", unique: true
  end

  create_table "business_activities", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "freezone", null: false
    t.string "activity_code", null: false
    t.string "activity_name", null: false
    t.text "activity_description"
    t.string "activity_type", null: false
    t.string "property_requirements"
    t.text "notes"
    t.string "classification"
    t.string "regulation_type", default: "Non-Regulated", null: false
    t.string "approving_entity_1"
    t.string "approving_entity_2"
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["activity_code"], name: "index_business_activities_on_activity_code", unique: true
    t.index ["activity_type"], name: "index_business_activities_on_activity_type"
    t.index ["deleted_at"], name: "index_business_activities_on_deleted_at"
    t.index ["freezone", "activity_type"], name: "index_business_activities_on_freezone_and_activity_type"
    t.index ["freezone"], name: "index_business_activities_on_freezone"
    t.index ["regulation_type"], name: "index_business_activities_on_regulation_type"
  end

  create_table "business_activity_fees", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "pricing_catalog_id", null: false
    t.string "code", null: false
    t.string "label", null: false
    t.text "description"
    t.decimal "price", precision: 10, scale: 2, null: false
    t.string "currency", default: "AED"
    t.jsonb "conditions", default: {}
    t.jsonb "metadata", default: {}
    t.boolean "active", default: true, null: false
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_business_activity_fees_on_active"
    t.index ["code"], name: "index_business_activity_fees_on_code"
    t.index ["deleted_at"], name: "index_business_activity_fees_on_deleted_at"
    t.index ["pricing_catalog_id"], name: "index_business_activity_fees_on_pricing_catalog_id"
  end

  create_table "companies", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "trade_name"
    t.string "license_number"
    t.string "free_zone", null: false
    t.string "status", default: "draft", null: false
    t.uuid "owner_id"
    t.text "activity_codes", default: [], array: true
    t.jsonb "metadata", default: {}
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "draft_token"
    t.string "formation_type"
    t.decimal "estimated_annual_turnover", precision: 15, scale: 2
    t.string "formation_step"
    t.integer "completion_percentage", default: 0
    t.jsonb "auto_save_data", default: {}
    t.datetime "submitted_at"
    t.datetime "approved_at"
    t.datetime "rejected_at"
    t.datetime "formed_at"
    t.integer "trade_license_validity", default: 1
    t.integer "visa_package", default: 0
    t.integer "partner_visa_count", default: 0
    t.integer "inside_country_visas", default: 0
    t.integer "outside_country_visas", default: 0
    t.boolean "establishment_card", default: false
    t.string "require_investor_or_partner_visa"
    t.decimal "share_capital", precision: 15, scale: 2, default: "150000.0"
    t.decimal "share_value", precision: 10, scale: 2, default: "10.0"
    t.integer "total_shares"
    t.boolean "voting_rights_proportional", default: true
    t.text "voting_rights_notes"
    t.string "shareholding_type"
    t.uuid "main_activity_id"
    t.boolean "request_custom_activity", default: false
    t.text "custom_activity_description"
    t.string "countries_of_operation", default: ["UAE"], array: true
    t.boolean "operate_as_franchise", default: false
    t.text "franchise_details"
    t.string "name_options", default: [], array: true
    t.string "name_arabic"
    t.string "license_type"
    t.string "license_status"
    t.string "business_community"
    t.date "first_license_issue_date"
    t.date "current_license_issue_date"
    t.date "license_expiry_date"
    t.string "establishment_card_number"
    t.date "establishment_card_issue_date"
    t.date "establishment_card_expiry_date"
    t.string "gm_signatory_name"
    t.string "gm_signatory_email"
    t.boolean "ubo_terms_accepted", default: false
    t.boolean "accept_activity_rules", default: false
    t.index ["deleted_at"], name: "index_companies_on_deleted_at"
    t.index ["draft_token"], name: "index_companies_on_draft_token", unique: true
    t.index ["formation_step"], name: "index_companies_on_formation_step"
    t.index ["formation_type"], name: "index_companies_on_formation_type"
    t.index ["license_number"], name: "index_companies_on_license_number", unique: true
    t.index ["owner_id"], name: "index_companies_on_owner_id"
    t.index ["status", "owner_id"], name: "index_companies_on_status_and_owner"
    t.index ["status", "submitted_at"], name: "index_companies_on_status_and_submitted"
    t.index ["submitted_at"], name: "index_companies_on_submitted_at"
  end

  create_table "company_invitations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "company_id", null: false
    t.uuid "invited_by_id", null: false
    t.string "email", null: false
    t.string "role", default: "viewer", null: false
    t.string "status", default: "pending", null: false
    t.string "invitation_token", null: false
    t.text "message"
    t.datetime "invited_at"
    t.datetime "accepted_at"
    t.datetime "rejected_at"
    t.datetime "expires_at"
    t.jsonb "metadata", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id", "email"], name: "index_company_invitations_on_company_id_and_email", unique: true, where: "((status)::text = 'pending'::text)"
    t.index ["company_id"], name: "index_company_invitations_on_company_id"
    t.index ["email"], name: "index_company_invitations_on_email"
    t.index ["expires_at"], name: "index_company_invitations_on_expires_at"
    t.index ["invitation_token"], name: "index_company_invitations_on_invitation_token", unique: true
    t.index ["invited_by_id"], name: "index_company_invitations_on_invited_by_id"
    t.index ["status"], name: "index_company_invitations_on_status"
  end

  create_table "company_memberships", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "company_id", null: false
    t.uuid "user_id", null: false
    t.string "role", default: "viewer", null: false
    t.jsonb "permissions", default: {}
    t.datetime "invited_at"
    t.datetime "accepted_at"
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id", "user_id"], name: "index_company_memberships_on_company_id_and_user_id", unique: true, where: "(deleted_at IS NULL)"
    t.index ["company_id"], name: "index_company_memberships_on_company_id"
    t.index ["deleted_at"], name: "index_company_memberships_on_deleted_at"
    t.index ["role"], name: "index_company_memberships_on_role"
    t.index ["user_id"], name: "index_company_memberships_on_user_id"
  end

  create_table "documents", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "company_id", null: false
    t.uuid "workflow_step_id"
    t.string "name", null: false
    t.string "document_type"
    t.string "file_name", null: false
    t.bigint "file_size", null: false
    t.string "content_type", null: false
    t.string "storage_path", null: false
    t.string "storage_bucket", default: "documents"
    t.string "ocr_status", default: "pending"
    t.jsonb "ocr_data", default: {}
    t.decimal "confidence_score", precision: 5, scale: 4
    t.text "extracted_text"
    t.jsonb "metadata", default: {}
    t.datetime "uploaded_at"
    t.datetime "processed_at"
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id"
    t.uuid "person_id"
    t.jsonb "extracted_data", default: {}
    t.jsonb "fraud_assessment", default: {}
    t.text "file_data"
    t.text "thumbnail_data"
    t.boolean "verified", default: false
    t.datetime "verified_at"
    t.uuid "verified_by_id"
    t.datetime "ocr_completed_at"
    t.datetime "fraud_check_completed_at"
    t.string "document_category"
    t.string "document_sub_type"
    t.boolean "is_ubo_document", default: false
    t.uuid "parent_company_id"
    t.date "expiry_date"
    t.date "issue_date"
    t.string "issuing_country"
    t.string "issuing_authority"
    t.index "((fraud_assessment ->> 'risk_band'::text))", name: "index_documents_on_fraud_risk_band", where: "(fraud_assessment IS NOT NULL)"
    t.index ["company_id"], name: "index_documents_on_company_id"
    t.index ["deleted_at"], name: "index_documents_on_deleted_at"
    t.index ["document_category"], name: "index_documents_on_document_category"
    t.index ["document_sub_type"], name: "index_documents_on_document_sub_type"
    t.index ["document_type"], name: "index_documents_on_document_type"
    t.index ["expiry_date"], name: "index_documents_on_expiry_date"
    t.index ["extracted_data"], name: "index_documents_on_extracted_data", using: :gin
    t.index ["fraud_assessment"], name: "index_documents_on_fraud_assessment", using: :gin
    t.index ["is_ubo_document"], name: "index_documents_on_is_ubo_document"
    t.index ["ocr_status"], name: "index_documents_on_ocr_status"
    t.index ["parent_company_id"], name: "index_documents_on_parent_company_id"
    t.index ["person_id"], name: "index_documents_on_person_id"
    t.index ["storage_path"], name: "index_documents_on_storage_path", unique: true
    t.index ["uploaded_at"], name: "index_documents_on_uploaded_at"
    t.index ["user_id"], name: "index_documents_on_user_id"
    t.index ["verified"], name: "index_documents_on_verified"
    t.index ["workflow_step_id"], name: "index_documents_on_workflow_step_id"
  end

  create_table "freezones", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "code", null: false
    t.string "location"
    t.text "description"
    t.boolean "active", default: true, null: false
    t.string "website_url"
    t.string "contact_email"
    t.string "contact_phone"
    t.jsonb "metadata", default: {}
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_freezones_on_active"
    t.index ["code"], name: "index_freezones_on_code", unique: true
    t.index ["deleted_at"], name: "index_freezones_on_deleted_at"
    t.index ["name"], name: "index_freezones_on_name"
  end

  create_table "government_fees", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "pricing_catalog_id", null: false
    t.string "code", null: false
    t.string "label", null: false
    t.text "description"
    t.decimal "price", precision: 10, scale: 2, null: false
    t.string "currency", default: "AED"
    t.string "fee_type"
    t.jsonb "conditions", default: {}
    t.jsonb "metadata", default: {}
    t.boolean "active", default: true, null: false
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_government_fees_on_active"
    t.index ["code"], name: "index_government_fees_on_code"
    t.index ["deleted_at"], name: "index_government_fees_on_deleted_at"
    t.index ["fee_type"], name: "index_government_fees_on_fee_type"
    t.index ["pricing_catalog_id"], name: "index_government_fees_on_pricing_catalog_id"
  end

  create_table "license_packages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "pricing_catalog_id", null: false
    t.string "package_type", null: false
    t.integer "duration_years", null: false
    t.integer "visas_included", default: 0, null: false
    t.decimal "price_vat_inclusive", precision: 10, scale: 2, null: false
    t.decimal "price_vat_exclusive", precision: 10, scale: 2
    t.decimal "vat_rate", precision: 5, scale: 4, default: "0.05"
    t.jsonb "included_services", default: []
    t.jsonb "metadata", default: {}
    t.boolean "active", default: true, null: false
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_license_packages_on_active"
    t.index ["deleted_at"], name: "index_license_packages_on_deleted_at"
    t.index ["duration_years"], name: "index_license_packages_on_duration_years"
    t.index ["package_type"], name: "index_license_packages_on_package_type"
    t.index ["pricing_catalog_id"], name: "index_license_packages_on_pricing_catalog_id"
  end

  create_table "payments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "company_id", null: false
    t.uuid "workflow_step_id"
    t.string "stripe_payment_intent_id"
    t.string "payment_type", null: false
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.string "currency", default: "AED", null: false
    t.string "status", default: "pending", null: false
    t.text "description"
    t.jsonb "stripe_metadata", default: {}
    t.jsonb "payment_breakdown", default: {}
    t.datetime "paid_at"
    t.datetime "failed_at"
    t.text "failure_reason"
    t.datetime "refunded_at"
    t.decimal "refund_amount", precision: 10, scale: 2
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id", "status"], name: "index_payments_on_company_id_and_status"
    t.index ["company_id"], name: "index_payments_on_company_id"
    t.index ["deleted_at"], name: "index_payments_on_deleted_at"
    t.index ["paid_at"], name: "index_payments_on_paid_at"
    t.index ["payment_type"], name: "index_payments_on_payment_type"
    t.index ["status"], name: "index_payments_on_status"
    t.index ["stripe_payment_intent_id"], name: "index_payments_on_stripe_payment_intent_id", unique: true
    t.index ["workflow_step_id"], name: "index_payments_on_workflow_step_id"
  end

  create_table "people", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "company_id", null: false
    t.string "type", null: false
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "nationality"
    t.string "passport_number"
    t.string "emirates_id"
    t.date "date_of_birth"
    t.string "gender"
    t.decimal "share_percentage", precision: 5, scale: 2
    t.string "appointment_type"
    t.jsonb "contact_info", default: {}
    t.jsonb "metadata", default: {}
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.date "passport_expiry_date"
    t.date "passport_issue_date"
    t.float "passport_extraction_confidence"
    t.index ["company_id", "type"], name: "index_people_on_company_id_and_type"
    t.index ["company_id"], name: "index_people_on_company_id"
    t.index ["deleted_at"], name: "index_people_on_deleted_at"
    t.index ["emirates_id"], name: "index_people_on_emirates_id"
    t.index ["passport_expiry_date"], name: "index_people_on_passport_expiry_date"
    t.index ["passport_issue_date"], name: "index_people_on_passport_issue_date"
    t.index ["passport_number"], name: "index_people_on_passport_number"
    t.index ["type"], name: "index_people_on_type"
  end

  create_table "pricing_catalogs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "freezone_id", null: false
    t.string "currency", default: "AED", null: false
    t.string "version", default: "1.0", null: false
    t.text "description"
    t.jsonb "terms", default: []
    t.jsonb "metadata", default: {}
    t.boolean "active", default: true, null: false
    t.datetime "effective_from"
    t.datetime "effective_until"
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_pricing_catalogs_on_active"
    t.index ["deleted_at"], name: "index_pricing_catalogs_on_deleted_at"
    t.index ["effective_from"], name: "index_pricing_catalogs_on_effective_from"
    t.index ["effective_until"], name: "index_pricing_catalogs_on_effective_until"
    t.index ["freezone_id"], name: "index_pricing_catalogs_on_freezone_id"
  end

  create_table "pricing_promotions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "pricing_catalog_id", null: false
    t.string "key", null: false
    t.string "title", null: false
    t.text "description"
    t.string "applies_to"
    t.string "promotion_type"
    t.decimal "discount_value", precision: 10, scale: 2
    t.datetime "valid_from"
    t.datetime "valid_until"
    t.jsonb "conditions", default: {}
    t.jsonb "metadata", default: {}
    t.boolean "active", default: true, null: false
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_pricing_promotions_on_active"
    t.index ["applies_to"], name: "index_pricing_promotions_on_applies_to"
    t.index ["deleted_at"], name: "index_pricing_promotions_on_deleted_at"
    t.index ["key"], name: "index_pricing_promotions_on_key"
    t.index ["pricing_catalog_id"], name: "index_pricing_promotions_on_pricing_catalog_id"
    t.index ["valid_from"], name: "index_pricing_promotions_on_valid_from"
    t.index ["valid_until"], name: "index_pricing_promotions_on_valid_until"
  end

  create_table "requests", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "company_id", null: false
    t.uuid "requested_by_id", null: false
    t.string "request_type", null: false
    t.string "status", default: "pending", null: false
    t.string "title", null: false
    t.text "description"
    t.jsonb "request_data", default: {}
    t.jsonb "response_data", default: {}
    t.decimal "fee_amount", precision: 10, scale: 2
    t.string "fee_currency", default: "AED"
    t.datetime "submitted_at"
    t.datetime "processed_at"
    t.datetime "completed_at"
    t.text "notes"
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id", "status"], name: "index_requests_on_company_id_and_status"
    t.index ["company_id"], name: "index_requests_on_company_id"
    t.index ["deleted_at"], name: "index_requests_on_deleted_at"
    t.index ["request_type"], name: "index_requests_on_request_type"
    t.index ["requested_by_id"], name: "index_requests_on_requested_by_id"
    t.index ["status"], name: "index_requests_on_status"
    t.index ["submitted_at"], name: "index_requests_on_submitted_at"
  end

  create_table "service_fees", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "pricing_catalog_id", null: false
    t.string "code", null: false
    t.string "label", null: false
    t.text "description"
    t.string "category"
    t.decimal "price", precision: 10, scale: 2, null: false
    t.string "currency", default: "AED"
    t.jsonb "conditions", default: {}
    t.jsonb "metadata", default: {}
    t.boolean "active", default: true, null: false
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_service_fees_on_active"
    t.index ["category"], name: "index_service_fees_on_category"
    t.index ["code"], name: "index_service_fees_on_code"
    t.index ["deleted_at"], name: "index_service_fees_on_deleted_at"
    t.index ["pricing_catalog_id"], name: "index_service_fees_on_pricing_catalog_id"
  end

  create_table "shareholding_fees", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "pricing_catalog_id", null: false
    t.string "code", null: false
    t.string "label", null: false
    t.text "description"
    t.decimal "price", precision: 10, scale: 2, null: false
    t.string "currency", default: "AED"
    t.jsonb "conditions", default: {}
    t.jsonb "metadata", default: {}
    t.boolean "active", default: true, null: false
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_shareholding_fees_on_active"
    t.index ["code"], name: "index_shareholding_fees_on_code"
    t.index ["deleted_at"], name: "index_shareholding_fees_on_deleted_at"
    t.index ["pricing_catalog_id"], name: "index_shareholding_fees_on_pricing_catalog_id"
  end

  create_table "tax_registrations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "company_id", null: false
    t.string "registration_type", null: false
    t.string "status", default: "not_registered", null: false
    t.string "trn_number"
    t.date "registration_date"
    t.date "effective_date"
    t.date "next_filing_date"
    t.decimal "annual_turnover", precision: 15, scale: 2
    t.string "tax_period"
    t.jsonb "registration_details", default: {}
    t.jsonb "filing_history", default: []
    t.text "notes"
    t.datetime "applied_at"
    t.datetime "approved_at"
    t.datetime "rejected_at"
    t.text "rejection_reason"
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id", "registration_type"], name: "index_tax_registrations_on_company_id_and_registration_type", unique: true
    t.index ["company_id"], name: "index_tax_registrations_on_company_id"
    t.index ["deleted_at"], name: "index_tax_registrations_on_deleted_at"
    t.index ["next_filing_date"], name: "index_tax_registrations_on_next_filing_date"
    t.index ["registration_type"], name: "index_tax_registrations_on_registration_type"
    t.index ["status"], name: "index_tax_registrations_on_status"
    t.index ["trn_number"], name: "index_tax_registrations_on_trn_number", unique: true, where: "(trn_number IS NOT NULL)"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email", null: false
    t.string "first_name"
    t.string "last_name"
    t.jsonb "metadata", default: {}
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.integer "failed_attempts", default: 0, null: false
    t.string "unlock_token"
    t.datetime "locked_at"
    t.string "provider"
    t.string "uid"
    t.text "google_token"
    t.text "linkedin_token"
    t.boolean "is_admin", default: false, null: false
    t.string "otp_secret"
    t.boolean "otp_required_for_login", default: false
    t.datetime "last_otp_at"
    t.text "otp_backup_codes"
    t.string "current_otp"
    t.datetime "current_otp_sent_at"
    t.datetime "otp_verified_at"
    t.string "phone_number"
    t.boolean "phone_verified", default: false
    t.integer "translation_requests_count", default: 0, null: false
    t.datetime "translation_requests_reset_at"
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["current_otp"], name: "index_users_on_current_otp"
    t.index ["deleted_at"], name: "index_users_on_deleted_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["is_admin"], name: "index_users_on_is_admin"
    t.index ["phone_number"], name: "index_users_on_phone_number"
    t.index ["provider", "uid"], name: "index_users_on_provider_and_uid", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["translation_requests_reset_at"], name: "index_users_on_translation_requests_reset_at"
    t.index ["unlock_token"], name: "index_users_on_unlock_token", unique: true
  end

  create_table "visa_applications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "company_id", null: false
    t.uuid "person_id", null: false
    t.string "visa_type", null: false
    t.string "status", default: "entry_permit", null: false
    t.integer "current_stage", default: 1
    t.integer "total_stages", default: 5
    t.string "application_number"
    t.string "entry_permit_number"
    t.string "visa_number"
    t.date "entry_permit_date"
    t.date "medical_date"
    t.date "eid_appointment_date"
    t.date "stamping_date"
    t.date "visa_issuance_date"
    t.date "visa_expiry_date"
    t.decimal "visa_fee", precision: 10, scale: 2
    t.string "fee_currency", default: "AED"
    t.jsonb "application_data", default: {}
    t.jsonb "stage_history", default: []
    t.text "notes"
    t.datetime "submitted_at"
    t.datetime "completed_at"
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["application_number"], name: "index_visa_applications_on_application_number", unique: true, where: "(application_number IS NOT NULL)"
    t.index ["company_id", "status"], name: "index_visa_applications_on_company_id_and_status"
    t.index ["company_id"], name: "index_visa_applications_on_company_id"
    t.index ["deleted_at"], name: "index_visa_applications_on_deleted_at"
    t.index ["person_id"], name: "index_visa_applications_on_person_id"
    t.index ["status"], name: "index_visa_applications_on_status"
    t.index ["submitted_at"], name: "index_visa_applications_on_submitted_at"
    t.index ["visa_number"], name: "index_visa_applications_on_visa_number", unique: true, where: "(visa_number IS NOT NULL)"
    t.index ["visa_type"], name: "index_visa_applications_on_visa_type"
  end

  create_table "workflow_instances", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "company_id", null: false
    t.string "workflow_type", null: false
    t.string "status", default: "pending", null: false
    t.integer "current_step", default: 0
    t.jsonb "metadata", default: {}
    t.jsonb "form_data", default: {}
    t.datetime "started_at"
    t.datetime "completed_at"
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id", "workflow_type"], name: "index_workflow_instances_on_company_id_and_workflow_type"
    t.index ["company_id"], name: "index_workflow_instances_on_company_id"
    t.index ["deleted_at"], name: "index_workflow_instances_on_deleted_at"
    t.index ["status"], name: "index_workflow_instances_on_status"
    t.index ["workflow_type"], name: "index_workflow_instances_on_workflow_type"
  end

  create_table "workflow_steps", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "workflow_instance_id", null: false
    t.integer "step_number", null: false
    t.string "step_type", null: false
    t.string "title", null: false
    t.text "description"
    t.string "status", default: "pending", null: false
    t.jsonb "data", default: {}
    t.jsonb "validation_rules", default: {}
    t.datetime "started_at"
    t.datetime "completed_at"
    t.text "error_message"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["status"], name: "index_workflow_steps_on_status"
    t.index ["step_type"], name: "index_workflow_steps_on_step_type"
    t.index ["workflow_instance_id", "step_number"], name: "index_workflow_steps_on_workflow_instance_id_and_step_number", unique: true
    t.index ["workflow_instance_id"], name: "index_workflow_steps_on_workflow_instance_id"
  end

  add_foreign_key "application_progress", "companies", on_delete: :cascade
  add_foreign_key "billing_accounts", "companies"
  add_foreign_key "business_activity_fees", "pricing_catalogs"
  add_foreign_key "companies", "users", column: "owner_id"
  add_foreign_key "company_invitations", "companies"
  add_foreign_key "company_invitations", "users", column: "invited_by_id"
  add_foreign_key "company_memberships", "companies"
  add_foreign_key "company_memberships", "users"
  add_foreign_key "documents", "companies"
  add_foreign_key "documents", "people"
  add_foreign_key "documents", "users"
  add_foreign_key "documents", "workflow_steps"
  add_foreign_key "government_fees", "pricing_catalogs"
  add_foreign_key "license_packages", "pricing_catalogs"
  add_foreign_key "payments", "companies"
  add_foreign_key "payments", "workflow_steps"
  add_foreign_key "people", "companies"
  add_foreign_key "pricing_catalogs", "freezones"
  add_foreign_key "pricing_promotions", "pricing_catalogs"
  add_foreign_key "requests", "companies"
  add_foreign_key "requests", "users", column: "requested_by_id"
  add_foreign_key "service_fees", "pricing_catalogs"
  add_foreign_key "shareholding_fees", "pricing_catalogs"
  add_foreign_key "tax_registrations", "companies"
  add_foreign_key "visa_applications", "companies"
  add_foreign_key "visa_applications", "people"
  add_foreign_key "workflow_instances", "companies"
  add_foreign_key "workflow_steps", "workflow_instances"
end
