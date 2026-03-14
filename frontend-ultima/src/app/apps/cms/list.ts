import { NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';

interface Author {
    name: string;
    title: string;
    avatar: string;
}

interface Slide {
    id: number;
    image: string;
    title: string;
    category: string;
    author: Author;
}

interface BlogPost {
    id: number;
    category: string;
    date: string;
    title: string;
    description: string;
    link: string;
    hasImage: boolean;
    image?: string;
}

@Component({
    selector: 'app-list',
    imports: [NgClass],
    template: `
        <div class="p-4 md:p-6 card">
            <div class="relative w-full h-80 md:h-96 lg:h-[525px] rounded-2xl md:rounded-3xl overflow-hidden" (mouseenter)="stopAutoSlide()" (mouseleave)="startAutoSlide()">
                <div class="relative w-full h-full">
                    @for (slide of slides; track slide.id; let index = $index) {
                        <div class="absolute inset-0 transition-opacity duration-1000 ease-in-out" [ngClass]="{ 'opacity-100': currentSlide() === index, 'opacity-0': currentSlide() !== index }">
                            <img [src]="slide.image" [alt]="slide.title" class="w-full h-full object-cover" />
                            <div class="absolute inset-0 bg-linear-to-b from-black/0 to-black/30 to-70%"></div>
                        </div>
                    }
                </div>

                <div class="absolute w-full h-full flex flex-col justify-end gap-3 md:gap-4 top-0 left-0 p-4 md:p-6 lg:p-8">
                    <div class="flex flex-col gap-1 md:gap-2">
                        <div class="text-surface-0 dark:text-surface-0 text-md md:text-lg font-medium leading-relaxed">
                            {{ slides[currentSlide()].category }}
                        </div>
                        <div class="max-w-xs md:max-w-md text-surface-0 dark:text-surface-0 text-2xl md:text-3xl lg:text-4xl font-medium leading-tight">
                            {{ slides[currentSlide()].title }}
                        </div>
                    </div>

                    <div class="flex items-center gap-2 md:gap-3">
                        <div class="h-10 w-10 rounded-full border border-white/70 flex items-center justify-center overflow-hidden">
                            <img [src]="slides[currentSlide()].author.avatar" [alt]="slides[currentSlide()].author.name" class="w-8 h-8 rounded-full object-cover" />
                        </div>
                        <div class="flex flex-col pr-12">
                            <div class="text-surface-0 dark:text-surface-0 text-lg font-medium leading-relaxed">
                                {{ slides[currentSlide()].author.name }}
                            </div>
                            <div class="text-white/70 dark:text-white/70 text-sm font-normal leading-tight">
                                {{ slides[currentSlide()].author.title }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="absolute right-0 bottom-0 bg-white/25 rounded-tl-2xl md:rounded-tl-3xl border border-r-0 border-b-0 border-white/30 flex items-center text-surface-0">
                    <button (click)="prevSlide()" class="px-4 md:px-6 py-3 md:py-4 flex items-center justify-center hover:opacity-75 transition-opacity cursor-pointer" aria-label="Previous slide">
                        <i class="pi pi-arrow-left text-sm md:text-base pointer-events-none"></i>
                    </button>

                    <div class="w-px h-2 md:h-3 bg-white/25"></div>

                    <button (click)="nextSlide()" class="px-4 md:px-6 py-3 md:py-4 flex items-center justify-center hover:opacity-75 transition-opacity cursor-pointer" aria-label="Next slide">
                        <i class="pi pi-arrow-right text-sm md:text-base pointer-events-none"></i>
                    </button>
                </div>
            </div>

            <div class="mt-8 md:mt-12 grid grid-cols-12 gap-0">
                <div class="col-span-12 lg:col-span-4 xl:col-span-3 border-b lg:border-b-0 lg:border-r border-dashed border-surface-200 dark:border-surface-700 pr-0 lg:pr-6 pb-8 lg:pb-0">
                    <div class="flex flex-col gap-6">
                        @for (post of blogPosts[0]; track post.id; let index = $index; let last = $last) {
                            <div class="flex flex-col gap-4">
                                <div class="flex flex-col gap-2">
                                    <div class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">
                                        <span class="uppercase">{{ post.category }}</span> -
                                        <span class="uppercase">{{ post.date }}</span>
                                    </div>
                                    @if (post.hasImage && post.image) {
                                        <div class="h-48 md:h-64 bg-surface-100 dark:bg-surface-800 rounded-2xl md:rounded-3xl overflow-hidden">
                                            <img [src]="post.image" [alt]="post.title" class="w-full h-full object-cover" />
                                        </div>
                                    }
                                    <h3 class="text-surface-900 dark:text-surface-0 text-xl md:text-2xl font-medium leading-tight">
                                        {{ post.title }}
                                    </h3>
                                </div>
                                <p class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">
                                    {{ post.description }}
                                </p>
                                <div class="flex items-center gap-2">
                                    <span class="text-primary-600 dark:text-primary-400 text-base font-medium leading-normal cursor-pointer">
                                        {{ post.link }}
                                    </span>
                                    <i class="pi pi-arrow-right text-primary-600 dark:text-primary-400 text-xs"></i>
                                </div>
                            </div>

                            @if (!last) {
                                <div class="w-full h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>
                            }
                        }
                    </div>
                </div>

                <div class="col-span-12 lg:col-span-4 xl:col-span-6 border-b lg:border-b-0 lg:border-r border-dashed border-surface-200 dark:border-surface-700 px-0 lg:px-6 py-8 lg:py-0">
                    <div class="flex flex-col gap-6">
                        @for (post of blogPosts[1]; track post.id; let index = $index; let last = $last) {
                            <div class="flex flex-col gap-6">
                                <div class="flex flex-col gap-2">
                                    <div class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">
                                        <span class="uppercase">{{ post.category }}</span> -
                                        <span class="uppercase">{{ post.date }}</span>
                                    </div>
                                    <h3 class="text-surface-900 dark:text-surface-0 text-xl md:text-2xl font-medium leading-tight">
                                        {{ post.title }}
                                    </h3>
                                </div>
                                @if (post.hasImage && post.image) {
                                    <div class="h-64 md:h-72 bg-surface-100 dark:bg-surface-800 rounded-2xl md:rounded-3xl overflow-hidden">
                                        <img [src]="post.image" [alt]="post.title" class="w-full h-full object-cover" />
                                    </div>
                                }
                                <p class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">
                                    {{ post.description }}
                                </p>
                                <div class="flex items-center gap-2">
                                    <span class="text-primary-600 dark:text-primary-400 text-base font-medium leading-normal cursor-pointer">
                                        {{ post.link }}
                                    </span>
                                    <i class="pi pi-arrow-right text-primary-600 dark:text-primary-400 text-xs"></i>
                                </div>
                            </div>

                            @if (!last) {
                                <div class="w-full h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>
                            }
                        }
                    </div>
                </div>

                <div class="col-span-12 lg:col-span-4 xl:col-span-3 pl-0 lg:pl-6 pt-8 lg:pt-0">
                    <div class="flex flex-col gap-6">
                        @for (post of blogPosts[2]; track post.id; let index = $index; let last = $last) {
                            <div class="flex flex-col gap-4">
                                <div class="flex flex-col gap-2">
                                    <div class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">
                                        <span class="uppercase">{{ post.category }}</span> -
                                        <span class="uppercase">{{ post.date }}</span>
                                    </div>
                                    @if (post.hasImage && post.image) {
                                        <div class="h-48 md:h-64 bg-surface-100 dark:bg-surface-800 rounded-2xl md:rounded-3xl overflow-hidden">
                                            <img [src]="post.image" [alt]="post.title" class="w-full h-full object-cover" />
                                        </div>
                                    }
                                    <h3 class="text-surface-900 dark:text-surface-0 text-xl md:text-2xl font-medium leading-tight">
                                        {{ post.title }}
                                    </h3>
                                </div>
                                <p class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">
                                    {{ post.description }}
                                </p>
                                <div class="flex items-center gap-2">
                                    <span class="text-primary-600 dark:text-primary-400 text-base font-medium leading-normal cursor-pointer">
                                        {{ post.link }}
                                    </span>
                                    <i class="pi pi-arrow-right text-primary-600 dark:text-primary-400 text-xs"></i>
                                </div>
                            </div>

                            @if (!last) {
                                <div class="w-full h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>
                            }
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
export class List implements OnInit, OnDestroy {
    currentSlide = signal(0);
    private slideInterval: ReturnType<typeof setInterval> | null = null;

    slides: Slide[] = [
        {
            id: 1,
            image: '/demo/images/cms/cms-hero-1.jpg',
            title: 'How Manufacturing Giants Drive Economic Growth',
            category: 'Newest Blog',
            author: {
                name: 'Dianne Russell',
                title: 'CEO @ucs.ai',
                avatar: '/demo/images/cms/avatars/avatar-dianne.jpg'
            }
        },
        {
            id: 2,
            image: '/demo/images/cms/cms-hero-2.jpg',
            title: 'Investment Strategies for Industrial Sectors',
            category: 'Newest Blog',
            author: {
                name: 'Michael Chen',
                title: 'Business Strategist @ventures.co',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
            }
        },
        {
            id: 3,
            image: '/demo/images/cms/cms-hero-3.jpg',
            title: `Why Blue-Collar Jobs Are Banking's Best Bet`,
            category: 'Newest Blog',
            author: {
                name: 'Sarah Mitchell',
                title: 'E-commerce Expert @digitalcommerce.io',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face'
            }
        }
    ];

    blogPosts: BlogPost[][] = [
        [
            {
                id: 1,
                category: 'FINANCE',
                date: 'Oct 29, 2025',
                title: 'Industrial Investment Strategies That Drive Growth',
                description: 'Smart approaches to capitalize on manufacturing sector opportunities.',
                link: 'Discover industrial investment potential',
                hasImage: false
            },
            {
                id: 2,
                category: 'BANKING',
                date: 'Oct 24, 2025',
                title: "Energy Sector Banking: Powering Tomorrow's Economy",
                description:
                    'The energy transition is reshaping global markets, creating new opportunities for investors and businesses. From renewable infrastructure to traditional energy modernization, understanding financing trends helps you make informed decisions about portfolio diversification and long-term growth strategies.',
                link: 'Explore energy sector financing',
                hasImage: true,
                image: '/demo/images/cms/cms-list-1.jpg'
            },
            {
                id: 3,
                category: 'INVESTMENT',
                date: 'Oct 16, 2025',
                title: 'Space Technology: The Next Frontier for Investors',
                description: 'Aerospace innovations are creating unprecedented investment opportunities worldwide.',
                link: 'Launch your space investment strategy',
                hasImage: false
            },
            {
                id: 4,
                category: 'ECONOMY',
                date: 'Oct 7, 2025',
                title: 'Manufacturing Renaissance and Economic Recovery',
                description: 'How industrial growth is reshaping modern financial landscapes.',
                link: 'Analyze manufacturing market trends',
                hasImage: false
            }
        ],
        [
            {
                id: 5,
                category: 'AEROSPACE & INNOVATION',
                date: 'Oct 29, 2025',
                title: 'Financing the Future: Space Economy Investment Guide',
                description:
                    'The space economy is experiencing unprecedented growth, driven by private sector innovation and government partnerships. From satellite communications to space tourism, understanding investment opportunities in aerospace requires strategic financial planning. Explore how emerging space technologies are creating new markets and generating substantial returns for forward-thinking investors.',
                link: 'Explore aerospace investment opportunities',
                hasImage: true,
                image: '/demo/images/cms/cms-list-4.jpg'
            },
            {
                id: 6,
                category: 'CORPORATE FINANCE',
                date: 'Oct 27, 2025',
                title: 'Executive Leadership and Strategic Financial Planning',
                description:
                    'Effective corporate leadership requires mastering complex financial strategies that drive sustainable growth. From capital allocation to risk management, executive decision-making shapes company performance and shareholder value. Discover essential financial leadership principles that help executives navigate market volatility and capitalize on emerging opportunities.',
                link: 'Master executive financial strategies',
                hasImage: true,
                image: '/demo/images/cms/cms-list-7.jpg'
            }
        ],
        [
            {
                id: 7,
                category: 'TRAVEL',
                date: 'Oct 11, 2025',
                title: 'Global Economic Trends Shaping 2025',
                description: 'Navigate international markets with expert insights on emerging economic patterns. From supply chain innovations to currency fluctuations, stay informed about global financial developments.',
                link: 'Explore international market analysis',
                hasImage: false
            },
            {
                id: 8,
                category: 'BUSINESS',
                date: 'Oct 30, 2025',
                title: 'Industrial Automation: Financial Impact and Opportunities',
                description: 'Modern manufacturing is transforming through automation and smart technologies. Learn how these changes affect investment portfolios, job markets, and business valuation strategies.',
                link: 'Discover automation finance insights',
                hasImage: false
            },
            {
                id: 9,
                category: 'MANUFACTURING',
                date: 'Oct 2, 2025',
                title: 'Industrial Infrastructure: Building Financial Foundations',
                description:
                    'Strategic infrastructure investment is the cornerstone of economic development. Understanding how manufacturing facilities, energy systems, and industrial complexes create value helps investors identify long-term growth opportunities in the industrial sector.',
                link: 'Check out infrastructure investment guide',
                hasImage: true,
                image: '/demo/images/cms/cms-list-6.jpg'
            }
        ]
    ];

    ngOnInit() {
        this.startAutoSlide();
    }

    ngOnDestroy() {
        this.stopAutoSlide();
    }

    nextSlide() {
        this.currentSlide.set((this.currentSlide() + 1) % this.slides.length);
    }

    prevSlide() {
        this.currentSlide.set(this.currentSlide() === 0 ? this.slides.length - 1 : this.currentSlide() - 1);
    }

    startAutoSlide() {
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    stopAutoSlide() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }
}
