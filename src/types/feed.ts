export type PostAuthor = {
  id: string;
  name: string | null;
  image: string | null;
  profile: {
    username: string;
    photoUrl: string | null;
  } | null;
};

export type PostComment = {
  id: string;
  body: string;
  createdAt: string;
  author: PostAuthor;
};

export type ReactionCounts = {
  purrs: number;
  roars: number;
};

export type FeedPost = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  _count: {
    comments: number;
    reactions: number;
  };
  reactionCounts: ReactionCounts;
  userReaction: 'PURR' | 'ROAR' | null;
  comments?: PostComment[];
};

export type FeedResponse = {
  posts: FeedPost[];
  nextCursor?: string;
};
