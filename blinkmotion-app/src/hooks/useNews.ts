import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  ascii_url: string;
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

  const uploadAsciiArt = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `ascii/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('news_assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('news_assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const createNews = async (title: string, content: string, asciiFile?: File, asciiText?: string) => {
    setLoading(true);
    try {
      let ascii_url = '';
      
      if (asciiFile) {
        ascii_url = await uploadAsciiArt(asciiFile);
      } else if (asciiText) {
        const blob = new Blob([asciiText], { type: 'text/plain' });
        const file = new File([blob], 'news_ascii.txt', { type: 'text/plain' });
        ascii_url = await uploadAsciiArt(file);
      }

      const { error: err } = await supabase
        .from('blink_news')
        .insert([{ title, content, ascii_url }]);

      if (err) throw err;
      await fetchNews();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteNews = async (id: string, asciiUrl?: string) => {
    setLoading(true);
    try {
      // 1. Deletar do banco
      const { error: err } = await supabase
        .from('blink_news')
        .delete()
        .eq('id', id);

      if (err) throw err;

      // 2. Deletar do storage se existir URL
      if (asciiUrl) {
        const path = asciiUrl.split('/').pop();
        if (path) {
          await supabase.storage
            .from('news_assets')
            .remove([`ascii/${path}`]);
        }
      }

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
