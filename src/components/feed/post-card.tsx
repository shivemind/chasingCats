'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Trash2, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactionButtons } from './reaction-buttons';
import { CommentList } from './comment-list';
import { CommentForm } from './comment-form';
import { ShareButton } from './share-button';
import type { FeedPost, PostComment } from '@/types/feed';

type PostCardProps = {
  post: FeedPost;
  currentUserId: string;
  isAdmin?: boolean;
  hasPaidAccess?: boolean;
  onDelete?: (postId: string) => void;
};

export function PostCard({ post, currentUserId, isAdmin = false, hasPaidAccess = false, onDelete }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>(post.comments || []);
  const [commentCount, setCommentCount] = useState(post._count.comments);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = post.author.id === currentUserId;
  const canDelete = isAuthor || isAdmin;
  const displayName = post.author.profile?.username || post.author.name || 'Anonymous';
  const avatarUrl = post.author.profile?.photoUrl || post.author.image;

  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0 && commentCount > 0) {
      setIsLoadingComments(true);
      try {
        const res = await fetch(`/api/feed/${post.id}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments);
        }
      } catch (error) {
        console.error('Failed to load comments:', error);
      } finally {
        setIsLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleCommentAdded = (comment: PostComment) => {
    setComments([...comments, comment]);
    setCommentCount(commentCount + 1);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/feed/${post.id}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete?.(post.id);
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="rounded-2xl border border-night/10 bg-white p-4 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-night/10 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-night/50">
                {displayName[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-night">{displayName}</p>
            <p className="text-xs text-night/50">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-full p-2 text-night/40 hover:bg-red-50 hover:text-red-500 transition-colors"
            title={isAdmin && !isAuthor ? 'Delete post (admin)' : 'Delete post'}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        <p className="text-night whitespace-pre-wrap break-words">{post.content}</p>
        
        {post.imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden bg-night/5">
            <img
              src={post.imageUrl}
              alt=""
              className="w-full max-h-96 object-contain"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 sm:mt-4 flex items-center justify-between flex-wrap gap-2 border-t border-night/5 pt-3 sm:pt-4">
        <ReactionButtons
          postId={post.id}
          initialCounts={post.reactionCounts}
          initialUserReaction={post.userReaction}
          disabled={!hasPaidAccess}
        />

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleToggleComments}
            className={cn(
              'flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors active:scale-95',
              showComments
                ? 'bg-brand/10 text-brand'
                : 'bg-night/5 text-night/70 hover:bg-night/10 hover:text-night'
            )}
          >
            <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{commentCount}</span>
            {showComments ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
          
          <ShareButton postId={post.id} postContent={post.content} />
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-4 border-t border-night/5 pt-4 space-y-4">
          {isLoadingComments ? (
            <p className="text-sm text-night/50">Loading comments...</p>
          ) : (
            <CommentList comments={comments} />
          )}
          {hasPaidAccess ? (
            <CommentForm postId={post.id} onCommentAdded={handleCommentAdded} />
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-dashed border-night/20 bg-night/5 px-4 py-2 text-sm text-night/50">
              <Lock className="h-4 w-4" />
              <span>Upgrade to comment</span>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
