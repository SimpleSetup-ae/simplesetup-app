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

ActiveRecord::Schema[7.1].define(version: 18) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "companies", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "trade_name"
    t.string "license_number"
    t.string "free_zone", null: false
    t.string "status", default: "draft", null: false
    t.uuid "owner_id", null: false
    t.text "activity_codes", default: [], array: true
    t.jsonb "metadata", default: {}
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["deleted_at"], name: "index_companies_on_deleted_at"
    t.index ["license_number"], name: "index_companies_on_license_number", unique: true
    t.index ["owner_id"], name: "index_companies_on_owner_id"
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
    t.index "((fraud_assessment ->> 'risk_band'::text))", name: "index_documents_on_fraud_risk_band", where: "(fraud_assessment IS NOT NULL)"
    t.index ["company_id"], name: "index_documents_on_company_id"
    t.index ["deleted_at"], name: "index_documents_on_deleted_at"
    t.index ["document_type"], name: "index_documents_on_document_type"
    t.index ["extracted_data"], name: "index_documents_on_extracted_data", using: :gin
    t.index ["fraud_assessment"], name: "index_documents_on_fraud_assessment", using: :gin
    t.index ["ocr_status"], name: "index_documents_on_ocr_status"
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
    t.index ["company_id", "type"], name: "index_people_on_company_id_and_type"
    t.index ["company_id"], name: "index_people_on_company_id"
    t.index ["deleted_at"], name: "index_people_on_deleted_at"
    t.index ["emirates_id"], name: "index_people_on_emirates_id"
    t.index ["passport_number"], name: "index_people_on_passport_number"
    t.index ["type"], name: "index_people_on_type"
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

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "clerk_id", null: false
    t.string "email", null: false
    t.string "first_name"
    t.string "last_name"
    t.jsonb "metadata", default: {}
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["clerk_id"], name: "index_users_on_clerk_id", unique: true
    t.index ["deleted_at"], name: "index_users_on_deleted_at"
    t.index ["email"], name: "index_users_on_email", unique: true
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

  add_foreign_key "companies", "users", column: "owner_id"
  add_foreign_key "company_memberships", "companies"
  add_foreign_key "company_memberships", "users"
  add_foreign_key "documents", "companies"
  add_foreign_key "documents", "people"
  add_foreign_key "documents", "users"
  add_foreign_key "documents", "workflow_steps"
  add_foreign_key "people", "companies"
  add_foreign_key "requests", "companies"
  add_foreign_key "requests", "users", column: "requested_by_id"
  add_foreign_key "workflow_instances", "companies"
  add_foreign_key "workflow_steps", "workflow_instances"
end
