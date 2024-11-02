class Api::V1::Auth::RegistrationsController < DeviseTokenAuth::RegistrationsController
  include ActionController::Cookies
end

