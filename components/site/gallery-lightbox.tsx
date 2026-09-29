'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function GalleryLightbox({ images: initial, albumId }: { images: { id: string; image_url: string; title?: string | null; caption?: string | null; display_order?: number }[]; albumId: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [images,setImages]=useState(initial);
  const [more,setMore]=useState(initial.length===48);
  const [loading,setLoading]=useState(false);
  async function loadMore(){if(loading)return;setLoading(true);const {data,error}=await createClient().from('gallery_items').select('id,image_url,title,caption,display_order').eq('album_id',albumId).eq('status','published').order('display_order').range(images.length,images.length+47);if(!error){setImages(old=>[...old,...(data||[])]);setMore((data?.length||0)===48)}setLoading(false)}
  return <><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{images.map((item)=><button key={item.id} onClick={()=>setSelected(item.image_url)} className="overflow-hidden rounded-xl border bg-card text-left shadow-premium"><img loading="lazy" src={item.image_url} alt={item.title||item.caption||'ASAM photo'} className="aspect-square w-full object-cover transition-transform hover:scale-[1.02]"/>{(item.title||item.caption)&&<span className="block p-3 text-sm text-muted-foreground">{item.title||item.caption}</span>}</button>)}</div>{more&&<button onClick={()=>void loadMore()} disabled={loading} className="mx-auto mt-8 block rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50">{loading?'Loading…':'Load more photos'}</button>}{selected&&<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4" onClick={()=>setSelected(null)}><button aria-label="Close image" className="absolute right-5 top-5 rounded-full bg-black/50 p-2 text-white"><X/></button><img src={selected} alt="Expanded ASAM gallery image" className="max-h-[90vh] max-w-full object-contain"/></div>}</>;
}
