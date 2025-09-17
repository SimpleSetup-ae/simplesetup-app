class MakeOwnerIdOptionalInCompanies < ActiveRecord::Migration[7.1]
  def change
    change_column_null :companies, :owner_id, true
  end
end
