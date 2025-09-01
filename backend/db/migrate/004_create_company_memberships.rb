class CreateCompanyMemberships < ActiveRecord::Migration[7.1]
  def change
    create_table :company_memberships, id: :uuid do |t|
      t.references :company, null: false, foreign_key: true, type: :uuid
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :role, null: false, default: 'viewer'
      t.jsonb :permissions, default: {}
      t.datetime :invited_at
      t.datetime :accepted_at
      t.datetime :deleted_at, index: true
      
      t.timestamps
    end
    
    add_index :company_memberships, [:company_id, :user_id], unique: true, where: "deleted_at IS NULL"
    add_index :company_memberships, :role
  end
end
