'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function ManagedFaqs({ category }: { category: string }) {
  const [items,setItems]=useState<{id:string;question:string;answer:string}[]>([]);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{let active=true;void createClient().from('faqs').select('id,question,answer').eq('status','published').eq('category',category).order('display_order').limit(50).then(({data,error})=>{if(!active)return;if(error)setFailed(true);else setItems(data||[])});return()=>{active=false}},[category]);
  if(failed)return <p className="mt-8 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Answers are temporarily unavailable.</p>;
  if(!items.length)return <p className="mt-8 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No published {category.toLowerCase()} FAQs yet.</p>;
  return <div className="mt-8 space-y-4">{items.map((item,i)=><article key={item.id} className="animate-fade-up rounded-2xl border border-border bg-card p-5 shadow-premium" style={{animationDelay:`${i*.05}s`}}><h3 className="mb-2 text-sm font-semibold">{item.question}</h3><p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{item.answer}</p></article>)}</div>;
}
