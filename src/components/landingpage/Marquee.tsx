import { cn } from "@/lib/utils";
import Marquee from "@/components/magicui/marquee";
import Image from "next/image";
import Link from "next/link";

const reviews = [
  {
    name: "robin",
    website: "jamal.auracv.me",
    img: "/profile/jamal.jpeg",
  },
  {
    name: "Moritz Pail",
    website: "moritzpail.auracv.me",
    img: "/profile/moritz-pail.jpg",
  },
  {
    name: "Goutham",
    website: "goutham.auracv.me",
    img: "/profile/goutham.jpeg",
  },
  {
    name: "Jeff",
    website: "jeff.auracv.me",
    img: "/profile/jeff.jpeg",
  },
  {
    name: "Vaidyanath",
    website: "vaidyan.auracv.me",
    img: "/profile/vaidyan.jpeg",
  },
  {
    name: "Anand",
    website: "anand.auracv.me",
    img: "/profile/anand.jpeg",
  },
  {
    name: "James",
    website: "james.auracv.me",
    img: "/profile/james.jpeg",
  },
];

const ReviewCard = ({
  img,
  name,
  website,
}: {
  img: string;
  name: string;
  website: string;
}) => {
  return (
    <figure
      className={cn(
        "group relative w-56 overflow-hidden rounded-2xl sm:w-64",
        "border border-ink/10 bg-white/70 p-4 backdrop-blur-sm",
        "transition duration-300 hover:-translate-y-0.5 hover:border-aura-violet/30 hover:shadow-[0_16px_40px_-20px_rgba(33,27,18,0.35)]",
      )}
    >
      <Link
        target="_blank"
        href={"https://" + website}
        className="flex flex-row items-center justify-between gap-2"
      >
        <div className="flex flex-row items-center gap-3">
          <Image
            className="rounded-full ring-1 ring-ink/10"
            width={32}
            height={32}
            alt={`${name}'s portfolio`}
            src={img}
          />
          <div className="flex flex-col">
            <figcaption className="font-fraunces text-sm font-semibold text-ink">
              {name}
            </figcaption>
            <p className="text-xs font-medium text-ink-mute">{website}</p>
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-4 text-ink-mute transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
          />
        </svg>
      </Link>
    </figure>
  );
};

export function MarqueeDemo() {
  return (
    <div className="relative flex h-fit w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:24s]">
        {reviews.map((review) => (
          <ReviewCard key={review.name} {...review} />
        ))}
      </Marquee>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-parchment-100 sm:w-1/3" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-parchment-100 sm:w-1/3" />
    </div>
  );
}
