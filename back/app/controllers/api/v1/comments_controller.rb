class Api::V1::CommentsController < ApplicationController
  before_action :authenticate_user!, only: [:create,:destroy]
  before_action :set_commentable, only: [:create]
  before_action :set_comment, only: [:destroy]

  #リリース段階ではProjectに対するコメントのみ実装であり拡張予定
  def create
    @comment = @commentable.comments.build(comment_params.except(:project_id))
    @comment.user = current_user
    @comment.commentable_type = "Project"
    @comment.commentable_id = @commentable.id

    if @comment.save
      render json: { message: "コメントしました", comment: @comment.as_json(only: [:id]) },  status: :created
    else
      render json: { errors: @comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    if @comment.destroy
      render json: { message: "コメントを削除しました", comment: { id: nil } }, status: :ok
    else
      render json: { message: "コメントの削除に失敗しました" }, status: :unprocessable_entity
    end
  end


  private

  def set_commentable
    if params[:comment][:project_id]
      @commentable = Project.find_by(id: params[:comment][:project_id])
      unless @commentable
        render json: { error: "コメント対象のプロジェクトが見つかりません" }, status: :not_found
      end
    else
      render json: { error: "プロジェクトIDが指定されていません" }, status: :unprocessable_entity
    end
  end

  def set_comment
    @comment = Comment.find_by(id: params[:id], user: current_user)
    unless @comment
      render json: { message: "コメントが見つからないか、削除する権限がありません" }, status: :not_found
    end
  end

  def comment_params
    params.require(:comment).permit(:content, :project_id)
  end
end




# class Api::V1::CommentsController < ApplicationController
#   before_action :authenticate_user!, only: [:create,:destroy]
#   before_action :set_commentable, only: [:create]
#   before_action :set_comment, only: [:destroy]

#   def create
#     @comment = @commentable.comments.build(comment_params)
#     @comment.user = current_user

#     if @comment.save
#       render json: { message: "コメントしました", comment: comment.as_json(only: [:id]) },  status: :created
#     else
#       render json: { errors: @comment.errors.full_messages }, status: :unprocessable_entity
#     end
#   end

#   def destroy
#     if @comment.destroy
#       render json: { message: "コメントを削除しました", comment: { id: nil } }, status: :ok
#     else
#       render json: { message: "コメントの削除に失敗しました" }, status: :unprocessable_entity
#     end
#   end


#   private

#   # コメント対象のホワイトリスト定義
#   ALLOWED_COMMENTABLES = ["Project", "Comment" ].freeze
#   def set_commentable
#     if ALLOWED_COMMENTABLES.include?(params[:commentable_type])
#     # paramsから取得した文字列をクラス名に変換
#       klass = params[:commentable_type].constantize rescue nil
#       if klass && klass.exists?(params[:commentable_id]) #対象自体が存在するか
#         @commentable = klass.find(params[:commentable_id]) #対象のオブジェクト取得
#       else
#         render json: { error: "コメント対象が見つかりません" }, status: :not_found
#       end
#     else
#       render json: { error: "無効なコメント対象です" }, status: :unprocessable_entity
#     end
#   end

#   def set_comment
#     @comment = Comment.find_by(id: params[:id], user: current_user)
#     unless @comment
#       render json: { message: "コメントが見つからないか、削除する権限がありません" }, status: :not_found
#     end
#   end

#   def comment_params
#     params.require(:comment).permit(:content, :parent_id)
#   end
# end
