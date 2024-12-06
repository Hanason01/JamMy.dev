require "test_helper"

class Api::V1::CollaborationsControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get api_v1_collaborations_show_url
    assert_response :success
  end
end
