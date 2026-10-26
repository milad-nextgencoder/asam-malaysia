import Image from 'next/image';
import type { ImgHTMLAttributes } from 'react';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height' | 'placeholder'> & {
  src: string; width?: number; height?: number;
};
/** Resize owned media; arbitrary editorial URLs retain a lazy native-image fallback. */
export function SiteImage({ src, alt = '', width = 1200, height = 800, loading = 'lazy', ...props }: Props) {
  const storage = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let owned = src.startsWith('/') && !src.startsWith('//');
  try { owned ||= Boolean(storage && new URL(src).origin === new URL(storage).origin && new URL(src).pathname.startsWith('/storage/v1/object/public/')); } catch { /* relative source */ }
  return owned
    ? <Image {...props} src={src} alt={alt} width={width} height={height} loading={loading} sizes={props.sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'} />
    : <img {...props} src={src} alt={alt} width={width} height={height} loading={loading} decoding="async" />;
}
