import { NgClass } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

interface Section {
    id: string;
    title: string;
}

@Component({
    selector: 'app-detail2',
    imports: [NgClass, ButtonModule, TagModule],
    template: `
        <div class="p-6 card h-[calc(100vh-9rem)] flex flex-col overflow-hidden">
            <div #scrollContainer class="grid grid-cols-12 gap-6 xl:gap-11 overflow-y-auto flex-1">
                <div class="col-span-12 xl:col-span-8 min-w-0">
                    <div class="flex flex-col gap-6 mb-8">
                        <div class="flex flex-col gap-2">
                            <div class="flex items-center gap-2">
                                <p-tag value="INDUSTRIAL ECONOMICS" severity="secondary" styleClass="!font-normal !leading-normal" />
                                <div class="text-surface-500 dark:text-surface-400 text-base">Newest Blog • 6 Min</div>
                            </div>
                            <h1 id="manufacturing-giants" class="text-surface-900 dark:text-surface-0 text-4xl font-medium leading-tight break-words">How Manufacturing Giants Drive Economic Growth</h1>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="flex items-center gap-2">
                                <img src="/demo/images/cms/avatars/avatar-dianne.jpg" alt="Dianne Russell" class="w-6 h-6 rounded-full border border-surface-200 dark:border-surface-700" />
                                <div class="text-surface-500 dark:text-surface-400 text-base">Dianne Russell</div>
                            </div>
                            <div class="w-px h-3 bg-surface-200 dark:bg-surface-700"></div>
                            <div class="text-surface-500 dark:text-surface-400 text-base">15.09.2025</div>
                            <div class="w-px h-3 bg-surface-200 dark:bg-surface-700"></div>
                            <div class="text-surface-500 dark:text-surface-400 text-base">6 minute read</div>
                        </div>
                        <div class="h-96 relative rounded-3xl overflow-hidden">
                            <img src="/demo/images/cms/cms-hero-1.jpg" alt="How Manufacturing Giants Drive Economic Growth" class="w-full h-full object-cover" />
                        </div>
                    </div>
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

                        <div id="manufacturing-investment" class="flex flex-col gap-8">
                            <div class="flex flex-col gap-3">
                                <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-medium leading-relaxed">Manufacturing Investment: Risk or Opportunity?</h2>
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

                        <div id="strategic-manufacturing" class="flex flex-col gap-8">
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
                                        <li class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">Job Creation (40%)  Manufacturing provides direct employment and supports service sector growth.</li>
                                        <li class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">Capital Investment (25%)  Infrastructure and equipment investments stimulate economic activity.</li>
                                        <li class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">Export Revenue (20%)  Manufactured goods generate foreign exchange and trade surplus.</li>
                                        <li class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">Technology Transfer (10%)  Innovation and skill development enhance productivity.</li>
                                        <li class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">Regional Development (5%)  Industrial clusters create economic hubs and attract investment.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div id="workforce-development" class="flex flex-col gap-8">
                            <div class="flex flex-col gap-3">
                                <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-medium leading-relaxed">Workforce Development and Skills Training</h2>
                                <p class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">
                                    Manufacturing success depends not only on capital and technology but also on a skilled, adaptable workforce. Leading industrial companies invest heavily in workforce development programs, creating pathways for
                                    workers to acquire advanced technical skills and adapt to evolving manufacturing technologies.
                                </p>
                            </div>

                            <div class="flex flex-col gap-3">
                                <h3 class="text-surface-900 dark:text-surface-0 text-xl font-medium leading-relaxed">Technical Skills and Certification Programs</h3>
                                <p class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">
                                    Modern manufacturing requires workers proficient in advanced machinery operation, quality control systems, and digital manufacturing tools. Partnerships between manufacturers and educational institutions create
                                    apprenticeship programs that combine classroom learning with hands-on experience, ensuring workers gain practical skills valued by employers.
                                </p>
                            </div>

                            <div class="flex flex-col gap-3">
                                <h3 class="text-surface-900 dark:text-surface-0 text-xl font-medium leading-relaxed">Continuous Learning and Career Advancement</h3>
                                <p class="text-surface-500 dark:text-surface-300 text-lg leading-relaxed">
                                    The rapid pace of technological change in manufacturing demands continuous learning opportunities. Forward-thinking manufacturers establish internal training programs, tuition assistance, and career development
                                    pathways that enable workers to advance from entry-level positions to supervisory and technical specialist roles. This investment in human capital reduces turnover, improves productivity, and builds organizational
                                    knowledge that strengthens competitive advantage.
                                </p>
                            </div>

                            <div class="flex items-start gap-4">
                                <div class="w-1 bg-primary-500 rounded-full self-stretch"></div>
                                <div class="flex-1">
                                    <span class="text-surface-900 dark:text-surface-0 text-lg font-medium">Skills Gap Challenge:</span>
                                    <span class="text-surface-500 dark:text-surface-300 text-lg">
                                        Research indicates that 80% of manufacturers report difficulty finding qualified workers with appropriate technical skills. Addressing this gap through strategic workforce development initiatives represents
                                        both a critical challenge and a significant opportunity for manufacturing growth and economic development.</span
                                    >
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

                        <div id="keep-reading" class="flex flex-col gap-12">
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
                <div class="hidden xl:block xl:col-span-4 self-start sticky top-0">
                    <div class="max-h-[calc(100vh-12rem)]">
                        <div class="w-full pl-6 flex flex-col">
                            <div class="flex items-center gap-5 relative">
                                <div class="flex items-center justify-center w-8 h-8 rounded-full border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 relative z-10 shrink-0">
                                    <i class="pi pi-list text-surface-900 dark:text-surface-0 text-xs"></i>
                                </div>
                                <div class="text-surface-500 dark:text-surface-400 text-base">On this page</div>
                            </div>

                            <div class="space-y-0 relative">
                                <div class="absolute left-4 top-[-20px] w-px bg-surface-200 dark:bg-surface-700" [style.height.px]="sections.length * 44"></div>

                                <div
                                    class="absolute left-4 w-[2px] rounded-lg h-6 bg-surface-900 dark:bg-surface-100 transition-all duration-300 ease-in-out top-0"
                                    [style.transform]="'translateY(' + getIndicatorOffset() + 'px) translateX(-0.5px)'"
                                ></div>

                                <div class="absolute left-4 w-2 h-2 rounded-full bg-surface-200 dark:bg-surface-700 -translate-x-[3px] z-10" [style.top.px]="sections.length * 44 - 22"></div>

                                @for (section of sections; track section.id) {
                                    <div
                                        (click)="scrollToSection(section.id)"
                                        class="flex items-center gap-5 h-11 cursor-pointer hover:text-surface-900 dark:hover:text-surface-0 transition-colors relative"
                                        [ngClass]="activeSection() === section.id ? 'text-surface-900 dark:text-surface-0' : 'text-surface-500 dark:text-surface-400'"
                                    >
                                        <div class="w-8 flex justify-center items-center"></div>
                                        <div class="flex-1 text-base truncate">{{ section.title }}</div>
                                    </div>
                                }
                            </div>
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
export class Detail2 implements OnInit, OnDestroy {
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;

    activeSection = signal('manufacturing-giants');
    isScrollBlocked = false;
    private scrollHandler: (() => void) | null = null;

    sections: Section[] = [
        { id: 'manufacturing-giants', title: 'How Manufacturing Giants Drive Economic Growth' },
        { id: 'manufacturing-investment', title: 'Manufacturing Investment: Risk or Opportunity?' },
        { id: 'strategic-manufacturing', title: 'Strategic Manufacturing Investment' },
        { id: 'workforce-development', title: 'Workforce Development and Skills Training' }
    ];

    ngOnInit() {
        this.scrollHandler = this.handleScroll.bind(this);
        setTimeout(() => {
            this.handleScroll();
            const container = this.scrollContainer?.nativeElement;
            if (container) {
                container.addEventListener('scroll', this.scrollHandler, { passive: true });
            }
        }, 0);
    }

    ngOnDestroy() {
        const container = this.scrollContainer?.nativeElement;
        if (container && this.scrollHandler) {
            container.removeEventListener('scroll', this.scrollHandler);
        }
    }

    scrollToSection(sectionId: string) {
        this.activeSection.set(sectionId);
        this.isScrollBlocked = true;

        const element = document.getElementById(sectionId);
        const container = this.scrollContainer?.nativeElement;

        if (element && container) {
            const yOffset = -80;
            const elementPosition = element.getBoundingClientRect().top;
            const containerPosition = container.getBoundingClientRect().top;
            const offsetPosition = container.scrollTop + elementPosition - containerPosition + yOffset;

            container.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            setTimeout(() => {
                this.isScrollBlocked = false;
                setTimeout(() => {
                    this.handleScroll();
                }, 50);
            }, 800);
        } else {
            this.isScrollBlocked = false;
        }
    }

    getIndicatorOffset(): number {
        const index = this.sections.findIndex((s) => s.id === this.activeSection());
        const baseOffset = index * 44;
        const isFirst = index === 0;
        const isLast = index === this.sections.length - 1;
        const adjustment = isFirst ? 13 : isLast ? -4 : 0;
        return baseOffset + adjustment;
    }

    private getElementTop(element: HTMLElement): number {
        const container = this.scrollContainer?.nativeElement;
        if (!container) return 0;
        const rect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        return rect.top - containerRect.top + container.scrollTop;
    }

    private getScrollTop(): number {
        const container = this.scrollContainer?.nativeElement;
        return container ? container.scrollTop : 0;
    }

    private handleScroll() {
        if (this.isScrollBlocked) {
            return;
        }

        const scrollTop = this.getScrollTop();
        const threshold = 100;
        const oldActiveSection = this.activeSection();

        const sectionElements = this.sections
            .map((section) => ({
                ...section,
                element: document.getElementById(section.id)
            }))
            .filter((section) => section.element)
            .map((section) => ({
                ...section,
                top: this.getElementTop(section.element!)
            }))
            .sort((a, b) => a.top - b.top);

        if (sectionElements.length === 0) {
            return;
        }

        let newActiveSection = sectionElements[0].id;

        for (let i = 0; i < sectionElements.length; i++) {
            const section = sectionElements[i];
            const hasPassedSection = scrollTop >= section.top - threshold;

            if (hasPassedSection) {
                newActiveSection = section.id;
            } else {
                break;
            }
        }

        if (oldActiveSection !== newActiveSection) {
            this.activeSection.set(newActiveSection);
        }
    }
}
