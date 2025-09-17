class AddOtpFieldsToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :otp_secret, :string
    add_column :users, :otp_required_for_login, :boolean, default: false
    add_column :users, :last_otp_at, :datetime
    add_column :users, :otp_backup_codes, :text
    add_column :users, :current_otp, :string
    add_column :users, :current_otp_sent_at, :datetime
    add_column :users, :otp_verified_at, :datetime
    add_column :users, :phone_number, :string
    add_column :users, :phone_verified, :boolean, default: false
    
    add_index :users, :current_otp
    add_index :users, :phone_number
  end
end
