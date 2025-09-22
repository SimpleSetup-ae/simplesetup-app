class AuthValidator < BaseValidator
  def initialize(email: nil, password: nil)
    @email = email
    @password = password
  end

  def validate
    @errors = []

    validate_email if @email
    validate_password if @password

    errors
  end

  private

  def validate_email
    return add_error "Email is required" if @email.blank?
    return add_error "Invalid email format" unless valid_email?
  end

  def validate_password
    return add_error "Password is required" if @password.blank?
    return add_error "Password must be at least 8 characters" if @password.length < 8
    return add_error "Password must contain at least one uppercase letter" unless @password =~ /[A-Z]/
    return add_error "Password must contain at least one lowercase letter" unless @password =~ /[a-z]/
    return add_error "Password must contain at least one number" unless @password =~ /[0-9]/
  end

  def valid_email?
    @email =~ /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i
  end
end
