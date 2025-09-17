class AddPassportExtractionConfidenceToPeople < ActiveRecord::Migration[7.1]
  def change
    add_column :people, :passport_extraction_confidence, :float
  end
end
