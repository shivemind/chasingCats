'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Trash2, ChevronDown, ChevronUp, Lock, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactionButtons } from './reaction-buttons';
import { CommentList } from './comment-list';
import { CommentForm } from './comment-form';
import { ShareButton } from './share-button';
import type { FeedPost, PostComment } from '@/types/feed';

type PostCardProps = {
  post: FeedPost;
  currentUserId?: string;  // Optional - may be undefined for non-logged-in users
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

  const isLoggedIn = !!currentUserId;
  const isAuthor = currentUserId && post.author.id === currentUserId;
  const canDelete = isAuthor || isAdmin;
  const canInteract = isLoggedIn && hasPaidAccess;
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
    <article className="rounded-2xl border border-emerald-500/20 bg-emerald-950/80 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-emerald-800/50 ring-2 ring-emerald-500/30 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-emerald-300">
                {displayName[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{displayName}</p>
            <p className="text-xs text-emerald-300/60">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-full p-2 text-emerald-400/50 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            title={isAdmin && !isAuthor ? 'Delete post (admin)' : 'Delete post'}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        <p className="text-emerald-50 whitespace-pre-wrap break-words">{post.content}</p>
        
        {post.imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden bg-black/30 ring-1 ring-emerald-500/20">
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
      <div className="mt-3 sm:mt-4 flex items-center justify-between flex-wrap gap-2 border-t border-emerald-500/20 pt-3 sm:pt-4">
        <ReactionButtons
          postId={post.id}
          initialCounts={post.reactionCounts}
          initialUserReaction={post.userReaction}
          disabled={!canInteract}
          disabledReason={!isLoggedIn ? 'not-logged-in' : !hasPaidAccess ? 'no-paid-access' : undefined}
        />

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleToggleComments}
            className={cn(
              'flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors active:scale-95',
              showComments
                ? 'bg-emerald-500/30 text-emerald-300'
                : 'bg-emerald-800/50 text-emerald-300/70 hover:bg-emerald-700/50 hover:text-emerald-200'
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
        <div className="mt-4 border-t border-emerald-500/20 pt-4 space-y-4">
          {isLoadingComments ? (
            <p className="text-sm text-emerald-300/50">Loading comments...</p>
          ) : (
            <CommentList comments={comments} />
          )}
          {canInteract ? (
            <CommentForm postId={post.id} onCommentAdded={handleCommentAdded} />
          ) : !isLoggedIn ? (
            <Link
              href="/login?callbackUrl=/feed"
              className="flex items-center gap-2 rounded-full border border-dashed border-emerald-500/30 bg-emerald-800/30 px-4 py-2 text-sm text-emerald-300/60 hover:bg-emerald-700/40 hover:text-emerald-300 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign in to comment</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-dashed border-emerald-500/30 bg-emerald-800/30 px-4 py-2 text-sm text-emerald-300/60">
              <Lock className="h-4 w-4" />
              <span>Upgrade to comment</span>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
