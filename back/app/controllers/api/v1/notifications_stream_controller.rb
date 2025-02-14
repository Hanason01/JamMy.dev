require Rails.root.join('lib', 'sse')
class Api::V1::NotificationsStreamController < ApplicationController
  include ActionController::Live #Pumaのマルチスレッド機能を利用
  before_action :authenticate_user!
  skip_after_action :update_auth_header

  def stream
    Rails.logger.info "🚀 stream アクション開始"

    Rails.logger.info "✅ 認証ユーザー: #{current_user.id}"

    response.headers['Content-Type'] = 'text/event-stream'
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['X-Accel-Buffering'] = 'no'

    Rails.logger.info "🛠 SSE ヘッダー設定: #{response.headers.inspect}"

    sse = SSE.new(response.stream)

    begin
      # 初回メッセージ送信
      sse.write({ event: "connection_established", data: "SSE 接続成功" }.to_json)
      Rails.logger.info "📡 初回メッセージ送信: SSE 接続成功"

      # # デバッグ: 5秒ごとに ping を送信
      # loop do
      #   break if response.stream.closed?
      #   sleep 5
      #   begin
      #     sse.write({ event: "ping", data: "サーバーは生きている" }.to_json)
      #     Rails.logger.info "📡 デバッグ送信: ping"
      #   rescue IOError => e
      #     Rails.logger.error "🔴 SSE 接続がクローズされました: #{e.message}"
      #     break
      #   end
      # end
      # Redis の Pub/Sub をリッスン
      $redis.subscribe("user:#{current_user.id}:has_unread") do |on|
        on.message do |channel, message|
          Rails.logger.info "📩 フロントに送信: #{message}"
          sse.write({ event: "new_notification", data: message }.to_json)
        end
      end
    rescue IOError => e
      Rails.logger.error "🔴 SSE 接続がクローズされました: #{e.message}"
    rescue StandardError => e
      Rails.logger.error "❌ SSE の予期しないエラー: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
    ensure
      Rails.logger.info "🔚 SSE ストリーム終了"
      sse.close
    end
  end
end
