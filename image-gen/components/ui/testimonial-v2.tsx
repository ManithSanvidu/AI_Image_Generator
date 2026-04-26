"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { QuoteIcon } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export interface TestimonialItem {
  text: string;
  image: string;
  name: string;
  role: string;
}

interface TestimonialsColumnProps {
  className?: string;
  testimonials: TestimonialItem[];
  duration?: number;
}

interface TestimonialV2Props {
  badge?: string;
  title?: string;
  description?: string;
  testimonials: TestimonialItem[];
}

function chunkTestimonials(testimonials: TestimonialItem[], size: number) {
  return Array.from({ length: Math.ceil(testimonials.length / size) }, (_, index) =>
    testimonials.slice(index * size, index * size + size),
  );
}

function TestimonialsColumn({
  className,
  testimonials,
  duration = 16,
}: TestimonialsColumnProps) {
  return (
    <div className={cn("w-full max-w-sm", className)}>
      <motion.ul
        animate={{ y: "-50%" }}
        transition={{
          duration,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          repeatType: "loop",
        }}
        className="m-0 flex list-none flex-col gap-6 p-0 pb-6"
      >
        {Array.from({ length: 2 }).map((_, duplicateIndex) => (
          <Fragment key={duplicateIndex}>
            {testimonials.map(({ text, image, name, role }, testimonialIndex) => (
              <motion.li
                key={`${duplicateIndex}-${testimonialIndex}-${name}`}
                aria-hidden={duplicateIndex === 1}
                tabIndex={duplicateIndex === 1 ? -1 : 0}
                whileHover={{
                  scale: 1.02,
                  y: -6,
                  transition: { type: "spring", stiffness: 320, damping: 24 },
                }}
                whileFocus={{
                  scale: 1.02,
                  y: -6,
                  transition: { type: "spring", stiffness: 320, damping: 24 },
                }}
                className="group rounded-3xl border border-border/70 bg-card/95 p-8 text-card-foreground shadow-lg shadow-black/10 backdrop-blur-sm transition-transform focus:outline-none focus:ring-2 focus:ring-ring/40"
              >
                <blockquote className="space-y-6">
                  <QuoteIcon className="size-5 text-primary" aria-hidden />
                  <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                    {text}
                  </p>

                  <footer className="flex items-center gap-3">
                    <Image
                      width={48}
                      height={48}
                      src={image}
                      alt={`Avatar of ${name}`}
                      className="size-12 rounded-full border border-border/70 object-cover"
                    />

                    <div className="flex min-w-0 flex-col">
                      <cite className="truncate text-sm font-semibold not-italic text-foreground">
                        {name}
                      </cite>
                      <span className="truncate text-sm text-muted-foreground">{role}</span>
                    </div>
                  </footer>
                </blockquote>
              </motion.li>
            ))}
          </Fragment>
        ))}
      </motion.ul>
    </div>
  );
}

export default function TestimonialV2({
  badge = "Testimonials",
  title = "What our users say",
  description = "Discover how teams streamline their workflows with Luma Studio.",
  testimonials,
}: TestimonialV2Props) {
  const columns = chunkTestimonials(testimonials, 3);

  return (
    <section aria-labelledby="testimonials-heading" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_38%)]" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto mb-16 flex max-w-2xl flex-col items-center text-center">
          <div className="rounded-full border border-border/70 bg-secondary/65 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-foreground">
            {badge}
          </div>

          <h2
            id="testimonials-heading"
            className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
          >
            {title}
          </h2>

          <p className="mt-5 max-w-xl text-balance text-base leading-7 text-muted-foreground sm:text-lg">
            {description}
          </p>
        </div>

        <div
          className="flex justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
          role="region"
          aria-label="Scrolling testimonials"
        >
          <TestimonialsColumn testimonials={columns[0] ?? []} duration={15} />
          <TestimonialsColumn
            testimonials={columns[1] ?? []}
            duration={18}
            className="hidden md:block"
          />
          <TestimonialsColumn
            testimonials={columns[2] ?? []}
            duration={16}
            className="hidden lg:block"
          />
        </div>
      </motion.div>
    </section>
  );
}
