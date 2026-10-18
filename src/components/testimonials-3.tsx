import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'
import Image from 'next/image'

export default function TestimonialSection() {
    const testimonials = [
        {
            name: 'Méschac Irung',
            role: 'Chef d’entreprise',
            stars: 5,
            avatar: 'https://avatars.githubusercontent.com/u/47919550?v=4',
            content: "Factur-X a sauvé mon entreprise. Je cherchais une solution simple et rapide pour mes factures, et c'est parfait.",
        },
        {
            name: 'Théo Balick',
            role: 'Indépendant',
            stars: 4,
            avatar: 'https://avatars.githubusercontent.com/u/68236786?v=4',
            content: 'La conformité Chorus Pro était un cauchemar avant. Avec cet outil, je convertis mes factures en PDF/A-3 en 2 secondes.',
        },
        {
            name: 'Glodie Lukose',
            role: 'Indépendant',
            stars: 5,
            avatar: 'https://avatars.githubusercontent.com/u/99137927?v=4',
            content: 'Très clair, très net. Plus aucune erreur de calcul de TVA ou d’oubli de mentions grâce au système.',
        },
    ]

    return (
        <section className="pt-4 md:pt-6 pb-12 md:pb-16">
            <div className="@container mx-auto w-full max-w-5xl px-6">
                <div className="@lg:grid-cols-2 @3xl:grid-cols-3 @3xl:gap-12 grid gap-6">
                    {testimonials.map((testimonial, index) => (
                        <div key={index}>
                            <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            'size-4',
                                            i < testimonial.stars
                                                ? 'fill-sage-600 stroke-sage-600 dark:fill-sage-400 dark:stroke-sage-400'
                                                : 'fill-foreground/15 stroke-transparent'
                                        )}
                                    />
                                ))}
                            </div>
                            <p className="text-foreground my-4 text-sm leading-relaxed">
                                {testimonial.content}
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="ring-foreground/10 size-6 border border-transparent shadow ring-1 rounded-full overflow-hidden shrink-0">
                                    <Image
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        width={28}
                                        height={28}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                                <div className="text-foreground text-sm font-medium">{testimonial.name}</div>
                                <span
                                    aria-hidden
                                    className="bg-foreground/25 size-1 rounded-full"
                                ></span>
                                <span className="text-muted-foreground text-sm">{testimonial.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
