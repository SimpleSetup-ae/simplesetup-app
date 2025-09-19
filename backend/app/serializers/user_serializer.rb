class UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :firstName, :lastName, :fullName, :isAdmin, :created_at, :updated_at

  def id
    object.id
  end

  def email
    object.email
  end

  def firstName
    object.first_name
  end

  def lastName
    object.last_name
  end

  def fullName
    object.full_name
  end

  def isAdmin
    object.admin?
  end

  def created_at
    object.created_at
  end

  def updated_at
    object.updated_at
  end
end
