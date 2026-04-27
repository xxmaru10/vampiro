import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  ascii_url: string;
  content_ascii?: string | null;
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
    setError(null);
    try {
      let ascii_url = '';
      const content_ascii = asciiText && asciiText.trim().length > 0 ? asciiText : null;

      // Só faz upload pra Storage se o usuário enviou um ARQUIVO.
      // Texto colado é gravado direto em `content_ascii` (sem dependência de bucket).
      if (asciiFile) {
        try {
          ascii_url = await uploadAsciiArt(asciiFile);
        } catch (uploadErr: any) {
          throw new Error(
            `Upload do arquivo ASCII falhou: ${uploadErr.message || uploadErr}. ` +
            `Crie o bucket "news_assets" no Supabase Storage ou cole o ASCII no campo de texto.`
          );
        }
      }

      // Tenta inserir com content_ascii. Se a coluna não existir, faz fallback sem ela.
      let insertErr = (await supabase
        .from('blink_news')
        .insert([{ title, content, ascii_url, content_ascii }])).error;

      if (insertErr && /content_ascii/i.test(insertErr.message)) {
        const fallback = await supabase
          .from('blink_news')
          .insert([{ title, content, ascii_url }]);
        insertErr = fallback.error;
        if (!insertErr) {
          setError(
            'Notícia publicada, mas a coluna content_ascii não existe. ' +
            'Rode: ALTER TABLE blink_news ADD COLUMN content_ascii TEXT;'
          );
        }
      }

      if (insertErr) throw insertErr;
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
