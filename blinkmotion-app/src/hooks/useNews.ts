import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  ascii_url: string;
  content_ascii?: string | null;
  published_at?: string | null;
  created_at: string;
}

export const useNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('blink_news')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) setError(err.message);
    else setNews(data || []);
    setLoading(false);
  };

  const createNews = async (
    title: string,
    content: string,
    asciiText?: string,
    publishedAt?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const content_ascii = asciiText && asciiText.trim().length > 0 ? asciiText : null;
      const published_at = publishedAt && publishedAt.trim().length > 0 ? publishedAt : null;

      const { error: insertErr } = await supabase
        .from('blink_news')
        .insert([{ title, content, ascii_url: '', content_ascii, published_at }]);

      if (insertErr) throw insertErr;
      await fetchNews();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteNews = async (id: string) => {
    setLoading(true);
    try {
      const { error: err } = await supabase
        .from('blink_news')
        .delete()
        .eq('id', id);

      if (err) throw err;
      await fetchNews();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return { news, loading, error, createNews, deleteNews, refresh: fetchNews };
};
