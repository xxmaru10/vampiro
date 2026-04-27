import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Comment {
  id: string;
  news_id: string;
  parent_id: string | null;
  author_name: string;
  content: string;
  is_npc: boolean;
  extra_likes: number;
  created_at: string;
  real_like_count: number;
  user_liked: boolean;
  replies: Comment[];
}

export interface BulkItem {
  author: string;
  is_npc?: boolean;
  content: string;
  likes?: number;
  replies?: BulkItem[];
}

export interface BulkPreset {
  id: string;
  name: string;
  data: BulkItem[];
  created_at: string;
}

const buildTree = (flat: any[], userId?: string): Comment[] => {
  const map: Record<string, Comment> = {};

  flat.forEach(c => {
    map[c.id] = {
      ...c,
      real_like_count: c.blink_comment_likes?.length ?? 0,
      user_liked: userId
        ? (c.blink_comment_likes ?? []).some((l: any) => l.user_id === userId)
        : false,
      replies: [],
    };
  });

  const roots: Comment[] = [];
  flat.forEach(c => {
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].replies.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });

  return roots;
};

const countBulkItems = (items: BulkItem[]): number =>
  items.reduce((acc, i) => acc + 1 + countBulkItems(i.replies ?? []), 0);

export const useComments = (newsId: string, userId?: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    if (!newsId) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('blink_comments')
      .select('*, blink_comment_likes(user_id)')
      .eq('news_id', newsId)
      .order('created_at', { ascending: true });

    if (err) { setError(err.message); setLoading(false); return; }
    setComments(buildTree(data ?? [], userId));
    setLoading(false);
  };

  const addComment = async (
    content: string,
    authorName: string,
    isNpc: boolean,
    parentId?: string
  ) => {
    const { error: err } = await supabase
      .from('blink_comments')
      .insert([{ news_id: newsId, parent_id: parentId ?? null, author_name: authorName, content, is_npc: isNpc, extra_likes: 0 }]);
    if (err) throw err;
    await fetchComments();
  };

  const toggleLike = async (commentId: string, currentlyLiked: boolean) => {
    if (!userId) return;
    if (currentlyLiked) {
      await supabase.from('blink_comment_likes').delete()
        .eq('comment_id', commentId).eq('user_id', userId);
    } else {
      await supabase.from('blink_comment_likes').insert([{ comment_id: commentId, user_id: userId }]);
    }
    await fetchComments();
  };

  const setExtraLikes = async (commentId: string, count: number) => {
    const { error: err } = await supabase
      .from('blink_comments')
      .update({ extra_likes: count })
      .eq('id', commentId);
    if (err) throw err;
    await fetchComments();
  };

  const deleteComment = async (commentId: string) => {
    await supabase.from('blink_comments').delete().eq('id', commentId);
    await fetchComments();
  };

  const bulkInsert = async (
    targetNewsId: string,
    items: BulkItem[],
    onProgress: (done: number, total: number) => void,
    rootParentId?: string
  ) => {
    let done = 0;
    const total = countBulkItems(items);

    const insertOne = async (item: BulkItem, parentId?: string): Promise<void> => {
      const { data, error: err } = await supabase
        .from('blink_comments')
        .insert([{
          news_id: targetNewsId,
          parent_id: parentId ?? null,
          author_name: item.author,
          content: item.content,
          is_npc: item.is_npc ?? false,
          extra_likes: item.likes ?? 0,
        }])
        .select('id')
        .single();
      if (err) throw err;
      done++;
      onProgress(done, total);
      for (const reply of item.replies ?? []) {
        await insertOne(reply, data.id);
      }
    };

    for (const item of items) await insertOne(item, rootParentId);
    await fetchComments();
  };

  // Presets
  const fetchPresets = async (): Promise<BulkPreset[]> => {
    const { data, error: err } = await supabase
      .from('blink_bulk_presets')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) throw err;
    return (data ?? []).map(p => ({ ...p, data: p.data as BulkItem[] }));
  };

  const savePreset = async (name: string, data: BulkItem[]) => {
    const { error: err } = await supabase
      .from('blink_bulk_presets')
      .insert([{ name, data }]);
    if (err) throw err;
  };

  const deletePreset = async (id: string) => {
    await supabase.from('blink_bulk_presets').delete().eq('id', id);
  };

  useEffect(() => { fetchComments(); }, [newsId, userId]);

  return {
    comments, loading, error,
    addComment, toggleLike, setExtraLikes, deleteComment,
    bulkInsert, fetchPresets, savePreset, deletePreset,
    refresh: fetchComments,
  };
};
