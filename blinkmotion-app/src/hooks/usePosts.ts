import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Post {
  id: string;
  author_name: string;
  user_id: string | null;
  is_npc: boolean;
  title: string;
  content: string;
  created_at: string;
  approved: boolean;
  comment_count?: number;
}

const PAGE_SIZE = 10;

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const fetchPage = useCallback(async (pageIndex: number, replace = false) => {
    setLoading(true);
    setError(null);
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error: err } = await supabase
      .from('blink_posts')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (err) { setError(err.message); setLoading(false); return; }

    const fetched = data ?? [];
    setPosts(prev => replace ? fetched : [...prev, ...fetched]);
    setHasMore(fetched.length === PAGE_SIZE);
    setPage(pageIndex);
    setLoading(false);
  }, []);

  const loadMore = () => fetchPage(page + 1);

  const refresh = () => fetchPage(0, true);

  const createPost = async (title: string, content: string, authorName: string, userId?: string, isNpc = false) => {
    const { error: err } = await supabase
      .from('blink_posts')
      .insert([{ title, content, author_name: authorName, user_id: userId ?? null, is_npc: isNpc, approved: isNpc }]);
    if (err) throw err;
    await fetchPage(0, true);
  };

  const approvePost = async (id: string) => {
    const { error: err } = await supabase
      .from('blink_posts')
      .update({ approved: true })
      .eq('id', id);
    if (err) throw err;
    await fetchPage(0, true);
  };

  const deletePost = async (id: string) => {
    const { error: err } = await supabase
      .from('blink_posts')
      .delete()
      .eq('id', id);
    if (err) throw err;
    await fetchPage(0, true);
  };

  const fetchUnapproved = async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('blink_posts')
      .select('*')
      .eq('approved', false)
      .order('created_at', { ascending: true });
    
    if (err) setError(err.message);
    else setPosts(data ?? []);
    setLoading(false);
  };

  return { posts, loading, hasMore, error, fetchPage, loadMore, refresh, createPost, deletePost, approvePost, fetchUnapproved };
};
