import Image from 'next/image';

interface HeroBannerProps {
  imageUrl: string;
  alt: string;
}

export default function HeroBanner({ imageUrl, alt }: HeroBannerProps) {
  return (
    <div className="w-full aspect-[2/1] md:aspect-[3/1] relative overflow-hidden rounded-none md:rounded-xl bg-gray-100">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
    </div>
  );
}
