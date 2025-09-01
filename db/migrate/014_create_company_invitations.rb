class CreateCompanyInvitations < ActiveRecord::Migration[7.1]
  def change
    create_table :company_invitations, id: :uuid do |t|
      t.references :company, null: false, foreign_key: true, type: :uuid
      t.references :invited_by, null: false, foreign_key: { to_table: :users }, type: :uuid
      t.string :email, null: false
      t.string :role, null: false, default: 'viewer'
      t.string :status, null: false, default: 'pending'
      t.string :invitation_token, null: false
      t.text :message
      t.datetime :invited_at
      t.datetime :accepted_at
      t.datetime :rejected_at
      t.datetime :expires_at
      t.jsonb :metadata, default: {}
      
      t.timestamps
    end
    
    add_index :company_invitations, :email
    add_index :company_invitations, :invitation_token, unique: true
    add_index :company_invitations, :status
    add_index :company_invitations, [:company_id, :email], unique: true, where: "status = 'pending'"
    add_index :company_invitations, :expires_at
  end
end
