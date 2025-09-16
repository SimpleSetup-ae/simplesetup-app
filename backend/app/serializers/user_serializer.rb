class UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :first_name, :last_name, :created_at, :updated_at

  def id
    object.id
  end

  def email
    object.email
  end

  def first_name
    object.first_name
  end

  def last_name
    object.last_name
  end

  def created_at
    object.created_at
  end

  def updated_at
    object.updated_at
  end
end
