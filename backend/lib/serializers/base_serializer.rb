class BaseSerializer
  def self.serialize(model, options = {})
    raise NotImplementedError, 'Subclasses must implement serialize(model, options)'
  end

  def self.collection(models, options = {})
    models.map { |m| serialize(m, options) }
  end
end


