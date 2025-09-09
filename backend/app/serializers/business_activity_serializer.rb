class BusinessActivitySerializer < ActiveModel::Serializer
  attributes :id, :freezone, :activity_code, :activity_name, :activity_description,
             :activity_type, :property_requirements, :notes, :classification,
             :regulation_type, :approving_entity_1, :approving_entity_2,
             :regulated, :professional, :commercial, :created_at, :updated_at

  def regulated
    object.regulated?
  end

  def professional
    object.professional?
  end

  def commercial
    object.commercial?
  end
end
