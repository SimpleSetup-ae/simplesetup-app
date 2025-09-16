module LockableWarnings
  extend ActiveSupport::Concern

  included do
    # Send warning email after 6 failed attempts (before the 10 attempt lock)
    after_update :send_warning_email_if_needed
  end

  private

  def send_warning_email_if_needed
    # Check if failed_attempts just reached 6
    if failed_attempts == 6 && failed_attempts_previously_changed?
      send_warning_email
    end
  end

  def send_warning_email
    # Send warning email about upcoming account lock
    DeviseWarningMailer.account_warning(self).deliver_now
  rescue => e
    Rails.logger.error "Failed to send warning email to #{email}: #{e.message}"
  end
end
