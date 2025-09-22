class FileValidator < BaseValidator
  def initialize(file)
    @file = file
  end

  def validate
    @errors = []

    validate_presence
    validate_type if @file
    validate_size if @file

    errors
  end

  private

  def validate_presence
    add_error "File is required" if @file.blank?
  end

  def validate_type
    valid_types = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    return add_error "Invalid file type. Allowed types: #{valid_types.join(', ')}" unless valid_types.include?(@file.content_type)
  end

  def validate_size
    max_size = 10.megabytes
    return add_error "File size must be less than #{max_size / 1.megabyte}MB" if @file.size > max_size
  end
end
