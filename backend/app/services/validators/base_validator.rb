class BaseValidator
  def self.validate(*args)
    new(*args).validate
  end

  def validate
    raise NotImplementedError, 'Subclasses must implement validate method'
  end

  private

  def add_error(error)
    @errors ||= []
    @errors << error
  end

  def errors
    @errors || []
  end
end
