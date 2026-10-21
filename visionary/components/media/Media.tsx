import Image, { getImageProps } from 'next/image';
import { preload } from 'react-dom';
import { media, type MediaItem, type MediaKey } from '@/lib/media';
import BackgroundVideo from './BackgroundVideo';

type Props = {
  id: MediaKey;
  className?: string;
  /** Fill the parent (parent must be position: relative). Default true. */
  fill?: boolean;
  sizes?: string;
  /** Above-the-fold image (e.g. a hero): loads eagerly with high fetch priority. (Next 16 deprecated next/image `priority`.) */
  priority?: boolean;
};

/**
 * Renders an image or a video from the media registry (lib/media.ts).
 * Swap a picture for a video by changing the registry entry; no component changes needed.
 */
export default function Media({ id, className, fill = true, sizes = '100vw', priority }: Props) {
  const item = media[id] as MediaItem;
  if (item.type === 'video') {
    // Above-the-fold video: fetch its poster (the first thing painted) with high priority.
    if (priority) preload(item.poster, { as: 'image', fetchPriority: 'high' });
    return <BackgroundVideo item={item} className={[className, fill ? 'media-fill' : ''].filter(Boolean).join(' ')} decorative={!item.alt} />;
  }
  if (item.type === 'art') {
    const common = { alt: item.alt, sizes, ...(priority ? ({ loading: 'eager', fetchPriority: 'high' } as const) : {}) };
    const tall = getImageProps({ ...common, ...item.tall }).props.srcSet;
    const { srcSet: wide, ...img } = getImageProps({ ...common, ...item.wide }).props;
    return (
      <picture>
        <source media={item.tallWhen} srcSet={tall} sizes={sizes} />
        <img {...img} srcSet={wide} className={className} style={fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%' } : { width: '100%', height: 'auto' }} />
      </picture>
    );
  }
  const load = priority ? ({ loading: 'eager', fetchPriority: 'high' } as const) : {};
  return fill ? (
    <Image className={className} src={item.src} alt={item.alt} fill sizes={sizes} {...load} />
  ) : (
    <Image className={className} src={item.src} alt={item.alt} width={item.width ?? 1600} height={item.height ?? 1000} sizes={sizes} {...load} />
  );
}
