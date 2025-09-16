class RemoveClerkIdFromUsers < ActiveRecord::Migration[7.1]
  def up
    remove_column :users, :clerk_id if column_exists?(:users, :clerk_id)
  end

  def down
    add_column :users, :clerk_id, :string unless column_exists?(:users, :clerk_id)
    add_index :users, :clerk_id, unique: true unless index_exists?(:users, :clerk_id)
  end
end
