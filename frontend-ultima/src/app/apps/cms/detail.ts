import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

interface Comment {
    image: string;
    name: string;
    title: string;
}

@Component({
    selector: 'app-detail',
    imports: [ButtonModule, DividerModule, TagModule],
    template: `
        <div class="p-6 card overflow-hidden">
            <div class="h-110 relative bg-linear-to-b from-transparent to-black/30 rounded-3xl overflow-hidden mb-8">
                <img src="/demo/images/cms/cms-hero-1.jpg" alt="How Manufacturing Giants Drive Economic Growth" class="w-full h-full object-cover absolute inset-0" />
                <div class="absolute bottom-6 left-6 right-6">
                    <div class="text-surface-0 text-lg font-medium mb-2">Newest Blog • 6 Min</div>
                    <h1 class="text-surface-0 text-4xl font-medium leading-tight break-words">How Manufacturing Giants Drive Economic Growth</h1>
                </div>
            </div>
            <div class="grid grid-cols-12 gap-6 xl:gap-11">
                <div class="col-span-12 xl:col-span-8 min-w-0">
                    <div class="flex flex-col gap-16">
                        <div class="flex flex-col gap-8">
                            <p class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">
                                Manufacturing powerhouses serve as the backbone of global economic growth, creating jobs, driving innovation, and establishing supply chains that span continents. These industrial giants not only produce essential
                                goods but also fuel economic development through massive capital investments, technological advancement, and workforce development. Understanding their impact reveals how strategic manufacturing investments can reshape
                                entire economies and create lasting prosperity for communities worldwide.
                            </p>

                            <div class="flex items-start gap-4">
                                <div class="w-1 bg-surface-900 dark:bg-surface-100 rounded-full self-stretch"></div>
                                <div class="flex-1">
                                    <span class="text-surface-900 dark:text-surface-0 text-lg font-medium">Industrial Impact:</span>
                                    <span class="text-surface-500 dark:text-surface-300 text-lg">
                                        Manufacturing contributes approximately 16% to global GDP and employs over 300 million people worldwide. Each manufacturing job typically supports 2-3 additional jobs in related sectors, creating a multiplier
                                        effect that drives regional economic development and infrastructure growth.</span
                                    >
                                </div>
                            </div>
                        </div>

                        <img src="/demo/images/cms/cms-hero-3.jpg" alt="Industrial Infrastructure Investment" class="w-full max-w-full h-96 object-cover rounded-3xl" />

                        <div class="flex flex-col gap-8">
                            <div class="flex flex-col gap-3">
                                <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-medium leading-relaxed break-words">Manufacturing Investment: Risk or Opportunity?</h2>
                                <p class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">
                                    Industrial investments carry inherent risks but offer substantial rewards for economies willing to embrace manufacturing excellence. Smart manufacturing strategies focus on automation, sustainability, and workforce
                                    development to ensure long-term competitiveness and growth.
                                </p>
                            </div>

                            <div class="flex flex-col gap-3">
                                <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-medium leading-relaxed">1. Capital Investment and Infrastructure Development</h2>
                                <p class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">
                                    Manufacturing giants invest billions in facility construction, equipment procurement, and infrastructure development. These investments create immediate construction jobs and establish long-term industrial capacity
                                    that attracts suppliers and support businesses to the region.
                                </p>
                            </div>

                            <div class="flex flex-col gap-3">
                                <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-medium leading-relaxed">2. Technology Transfer and Innovation Hubs</h2>
                                <p class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">
                                    Major manufacturers bring cutting-edge technologies and processes to new markets, fostering innovation ecosystems. Research and development centers create high-value jobs and drive technological advancement across
                                    multiple industries.
                                </p>
                            </div>

                            <div class="flex flex-col gap-3">
                                <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-medium leading-relaxed">3. Supply Chain Integration and Regional Development</h2>
                                <p class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">
                                    Industrial facilities require extensive supply networks, creating opportunities for local businesses to participate in global value chains. This integration develops regional manufacturing clusters that enhance
                                    economic resilience and competitiveness.
                                </p>
                            </div>
                        </div>

                        <div class="flex flex-col gap-8">
                            <div class="flex flex-col gap-4">
                                <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-medium leading-relaxed">Strategic Manufacturing Investment</h2>
                                <div class="p-6 bg-surface-100 dark:bg-surface-800 rounded-2xl">
                                    <blockquote class="text-surface-900 dark:text-surface-0 text-2xl font-medium leading-relaxed">
                                        "Manufacturing is not just about making things; it's about building economies, communities, and the foundation for sustainable prosperity."
                                    </blockquote>
                                </div>
                            </div>

                            <div class="flex flex-col gap-8">
                                <p class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">
                                    Modern manufacturing combines advanced technology with strategic workforce development to create competitive advantages. Countries and regions that invest in manufacturing infrastructure, education, and innovation
                                    typically experience accelerated economic growth, improved living standards, and enhanced global trade positions.
                                </p>

                                <div class="flex flex-col gap-4">
                                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-medium leading-relaxed">Key Drivers of Manufacturing-Led Economic Growth</h2>
                                    <ul class="flex flex-col gap-3 list-disc pl-5">
                                        <li class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">Job Creation (40%) – Manufacturing provides direct employment and supports service sector growth.</li>
                                        <li class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">Capital Investment (25%) – Infrastructure and equipment investments stimulate economic activity.</li>
                                        <li class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">Export Revenue (20%) – Manufactured goods generate foreign exchange and trade surplus.</li>
                                        <li class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">Technology Transfer (10%) – Innovation and skill development enhance productivity.</li>
                                        <li class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">Regional Development (5%) – Industrial clusters create economic hubs and attract investment.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-start gap-3">
                            <div class="p-1 rounded-full border border-surface-200 dark:border-surface-700">
                                <img src="/demo/images/cms/avatars/avatar-dianne.jpg" alt="Dianne Russell" class="w-8 h-8 rounded-full" />
                            </div>
                            <div class="flex-1 flex flex-col gap-3">
                                <div class="flex justify-between items-center">
                                    <div class="flex flex-col">
                                        <div class="text-surface-900 dark:text-surface-0 text-lg font-medium">Dianne Russell</div>
                                        <div class="text-surface-500 dark:text-surface-400 text-sm">Industrial Economics • 6 min read</div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <p-button icon="pi pi-youtube" severity="secondary" [rounded]="true" />
                                        <p-button icon="pi pi-twitter" severity="secondary" [rounded]="true" />
                                        <p-button icon="pi pi-facebook" severity="secondary" [rounded]="true" />
                                    </div>
                                </div>
                                <p class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">
                                    Manufacturing excellence drives economic transformation by creating jobs, fostering innovation, and building sustainable industrial ecosystems. Strategic investments in manufacturing infrastructure today lay the
                                    foundation for tomorrow's economic prosperity and global competitiveness.
                                </p>
                            </div>
                        </div>

                        <div class="flex flex-col gap-12">
                            <div class="flex flex-col gap-6">
                                <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-medium leading-relaxed">Keep Reading</h2>
                                <div class="flex flex-col gap-12">
                                    <div class="flex flex-col md:flex-row gap-6 md:gap-8">
                                        <img src="/demo/images/cms/cms-list-8.jpg" alt="Maritime Trade Finance" class="w-full max-w-full md:w-72 h-48 md:h-full object-cover rounded-2xl md:self-stretch" />
                                        <div class="flex-1 flex flex-col gap-3">
                                            <div class="text-surface-500 dark:text-surface-400 text-base">Jan 15, 2025 • 4 min read</div>
                                            <div class="flex flex-col gap-4">
                                                <h3 class="text-surface-900 dark:text-surface-0 text-2xl font-medium leading-relaxed">Maritime Trade Finance: Navigating Global Commerce</h3>
                                                <p class="text-surface-500 dark:text-surface-300 text-base leading-normal">
                                                    Discover how shipping infrastructure investments drive international trade, create economic opportunities, and establish vital supply chain connections.
                                                </p>
                                                <div class="flex items-center gap-3">
                                                    <div class="p-1 rounded-full border border-surface-200 dark:border-surface-700">
                                                        <img src="/demo/images/cms/avatars/avatar-sophia.jpg" alt="Sophia Bennett" class="w-8 h-8 rounded-full" />
                                                    </div>
                                                    <div class="flex flex-col">
                                                        <div class="text-surface-900 dark:text-surface-0 text-lg font-medium">Sophia Bennett</div>
                                                        <div class="text-surface-500 dark:text-surface-400 text-sm">Trade Finance Specialist</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex flex-col md:flex-row gap-6 md:gap-8">
                                        <img src="/demo/images/cms/cms-list-3.jpg" alt="Transportation Infrastructure Investment" class="w-full max-w-full md:w-72 h-48 md:h-full object-cover rounded-2xl" />
                                        <div class="flex-1 flex flex-col gap-3">
                                            <div class="text-surface-500 dark:text-surface-400 text-base">Jan 19, 2025 • 5 min read</div>
                                            <div class="flex flex-col gap-4">
                                                <h3 class="text-surface-900 dark:text-surface-0 text-2xl font-medium leading-relaxed">Rail Infrastructure: The Backbone of Economic Growth</h3>
                                                <p class="text-surface-500 dark:text-surface-300 text-base leading-normal">Strategic rail investments connect markets, reduce logistics costs, and unlock regional development opportunities.</p>
                                                <div class="flex items-center gap-3">
                                                    <div class="p-1 rounded-full border border-surface-200 dark:border-surface-700">
                                                        <img src="/demo/images/cms/avatars/avatar-ethan.jpg" alt="Ethan Clarke" class="w-8 h-8 rounded-full" />
                                                    </div>
                                                    <div class="flex flex-col">
                                                        <div class="text-surface-900 dark:text-surface-0 text-lg font-medium">Ethan Clarke</div>
                                                        <div class="text-surface-500 dark:text-surface-400 text-sm">Infrastructure Investment Analyst</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-span-12 xl:col-span-4">
                    <div class="flex flex-col">
                        <div class="flex justify-between items-center">
                            <div class="text-surface-900 dark:text-surface-0 text-lg font-medium">6 min read</div>
                            <div class="flex items-center gap-2">
                                <p-tag value="89" icon="pi pi-eye" severity="secondary" />
                                <p-tag value="247" icon="pi pi-heart" severity="secondary" />
                            </div>
                        </div>

                        <p-divider styleClass="!my-7" />

                        <div class="flex flex-col gap-8">
                            <div class="flex flex-col gap-2">
                                <div class="text-surface-900 dark:text-surface-0 text-lg font-medium">Published</div>
                                <div class="text-surface-500 dark:text-surface-300 text-lg">15.09.2025</div>
                            </div>
                            <div class="flex flex-col gap-2">
                                <div class="text-surface-900 dark:text-surface-0 text-lg font-medium">Author</div>
                                <div class="text-surface-500 dark:text-surface-300 text-lg">Marcus Chen</div>
                            </div>
                            <div class="flex flex-col gap-2">
                                <div class="text-surface-900 dark:text-surface-0 text-lg font-medium">Category</div>
                                <div class="text-surface-500 dark:text-surface-300 text-lg">Industrial Economics</div>
                            </div>
                        </div>

                        <p-divider styleClass="!my-7" />

                        <div class="flex flex-col gap-8">
                            <div class="flex flex-col gap-4">
                                <div class="text-surface-900 dark:text-surface-0 text-lg font-medium">Comments</div>
                                <div class="flex flex-col gap-6">
                                    @for (comment of comments.slice(0, 3); track comment.name) {
                                        <div class="flex items-center gap-4">
                                            <img [src]="comment.image" [alt]="comment.name" class="w-12 h-12 rounded-full border border-surface-200 dark:border-surface-700" />
                                            <div class="flex-1">
                                                <div class="text-surface-950 dark:text-surface-50 text-base font-medium">{{ comment.name }}</div>
                                                <div class="text-surface-500 dark:text-surface-400 text-sm">{{ comment.title }}</div>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                            <p-button [outlined]="true" severity="secondary" label="View Comments" styleClass="w-full" />
                        </div>

                        <p-divider styleClass="!my-7" />

                        <div class="flex gap-2">
                            <p-button icon="pi pi-youtube" severity="secondary" [rounded]="true" class="flex flex-1" styleClass="!w-full !rounded-[7rem]" />
                            <p-button icon="pi pi-twitter" severity="secondary" [rounded]="true" class="flex flex-1" styleClass="!w-full !rounded-[7rem]" />
                            <p-button icon="pi pi-facebook" severity="secondary" [rounded]="true" class="flex flex-1" styleClass="!w-full !rounded-[7rem]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: `
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        p {
            overflow-wrap: break-word;
            word-wrap: break-word;
            word-break: break-word;
        }
    `
})
export class Detail {
    comments: Comment[] = [
        {
            image: '/demo/images/cms/avatars/avatar-emma.jpg',
            name: 'Emma Stone',
            title: 'Founder'
        },
        {
            image: '/demo/images/cms/avatars/avatar-darrell.jpg',
            name: 'Darrell Steward',
            title: 'CEO'
        },
        {
            image: '/demo/images/cms/avatars/avatar-jane.jpg',
            name: 'Jane Cooper',
            title: 'Founder'
        }
    ];
}
