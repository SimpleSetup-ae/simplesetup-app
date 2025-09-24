class UpdateDocumentConfidencePrecision < ActiveRecord::Migration[7.1]
  def up
    change_column :documents, :confidence_score, :decimal, precision: 5, scale: 2
  end

  def down
    change_column :documents, :confidence_score, :decimal, precision: 5, scale: 4
  end
end

