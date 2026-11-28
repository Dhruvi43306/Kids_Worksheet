import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    ArrowUpRight,
    BookA,
    BookOpen,
    Brain,
    Calculator,
    Check,
    CheckCircle2,
    ChevronDown,
    ClipboardCheck,
    Gamepad2,
    Globe2,
    GraduationCap,
    Heart,
    Lightbulb,
    Paintbrush,
    PenLine,
    Puzzle,
    Sparkles,
    Users,
    WandSparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./ForEveryone.css";

type LearningItem = {
    title: string;
    subtitle: string;
    description: string;
    icon: LucideIcon;
    theme: string;
    href?: string;
    status: string;
    number: string;
};

const learningItems: LearningItem[] = [
    {
        title: "Mathematics",
        subtitle: "Think with numbers",
        description: "Explore counting, number sense, operations, patterns and problem-solving through worksheet practice.",
        icon: Calculator,
        theme: "math",
        href: "/math",
        status: "Available now",
        number: "01",
    },
    {
        title: "Reading & English",
        subtitle: "Discover words",
        description: "Build early reading skills with letters, phonics, sight words, rhyming words and comprehension.",
        icon: BookOpen,
        theme: "reading",
        href: "/reading",
        status: "Available now",
        number: "02",
    },
    {
        title: "Writing",
        subtitle: "Express your ideas",
        description: "Practise letter formation, handwriting, spelling, word building and sentence writing.",
        icon: PenLine,
        theme: "writing",
        status: "Coming soon",
        number: "03",
    },
    {
        title: "General Knowledge",
        subtitle: "Explore the world",
        description: "Discover animals, nature, science, places and interesting facts about everyday life.",
        icon: Globe2,
        theme: "knowledge",
        status: "Coming soon",
        number: "04",
    },
];

const activityItems = [
    {
        title: "Arts & Crafts",
        text: "Draw, color, make and bring imaginative ideas to life.",
        icon: Paintbrush,
        theme: "crafts",
        detail: "Create something wonderful",
    },
    {
        title: "Learning Games",
        text: "Practise through matching, memory games and playful challenges.",
        icon: Gamepad2,
        theme: "games",
        detail: "Play while you practise",
    },
    {
        title: "Brain Challenge",
        text: "Try puzzles, patterns, riddles and logic activities.",
        icon: Brain,
        theme: "brain",
        detail: "Think, solve and discover",
    },
];

const learningSteps = [
    {
        number: "01",
        title: "Choose a subject",
        description: "Start with Math or Reading and select the subject you want to practise.",
        icon: BookOpen,
        visual: "subject",
    },
    {
        number: "02",
        title: "Pick a topic",
        description: "Choose a topic such as Addition or Letter Recognition.",
        icon: Lightbulb,
        visual: "topic",
    },
    {
        number: "03",
        title: "Set up your worksheet",
        description: "Choose the available level, difficulty, category, question types and question count.",
        icon: WandSparkles,
        visual: "setup",
    },
    {
        number: "04",
        title: "Answer and check",
        description: "Solve the questions, then use Check Answer to review your work.",
        icon: ClipboardCheck,
        visual: "check",
    },
];

const audienceItems = [
    {
        title: "For Kids",
        eyebrow: "Curious minds",
        description: "Explore new topics, practise useful skills and enjoy learning through clear activities.",
        icon: Heart,
        theme: "kids",
    },
    {
        title: "For Parents",
        eyebrow: "Learning at home",
        description: "Find structured worksheet practice that can support your child's learning routine.",
        icon: Users,
        theme: "parents",
    },
    {
        title: "For Teachers",
        eyebrow: "Learning in class",
        description: "Explore question formats and resources that can support classroom practice.",
        icon: GraduationCap,
        theme: "teachers",
    },
];

const faqs = [
    {
        question: "What is Kids Worksheet?",
        answer: "Kids Worksheet is an educational platform where children can explore subjects, practise with generated worksheets and discover creative learning activities.",
    },
    {
        question: "Which subjects are available now?",
        answer: "Mathematics and Reading are the current subject areas. Writing and General Knowledge are planned additions and are shown as coming soon.",
    },
    {
        question: "How does worksheet generation work?",
        answer: "Choose a subject, topic, learning level, difficulty, available category and question types. Then choose an available question count and generate the worksheet.",
    },
    {
        question: "Can children learn without watching a video?",
        answer: "Yes. Videos are optional. The picture-based steps on this page explain the process with short captions and visual examples.",
    },
];

function LearningCard({ item }: { item: LearningItem }) {
    const Icon = item.icon;
    const cardContent = (
        <>
            <div className="fev-learning-card__top">
                <span className="fev-learning-card__number">{item.number}</span>
                <span className={`fev-status ${item.href ? "fev-status--live" : "fev-status--soon"}`}>
                    {item.href ? <Check size={13} /> : <Sparkles size={13} />}
                    {item.status}
                </span>
            </div>
            <span className="fev-learning-card__icon"><Icon size={29} strokeWidth={1.9} /></span>
            <span className="fev-learning-card__subtitle">{item.subtitle}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <span className="fev-learning-card__action">
                {item.href ? "Explore subject" : "Coming soon"}
                {item.href ? <ArrowUpRight size={18} /> : <Sparkles size={16} />}
            </span>
        </>
    );

    return item.href ? (
        <Link href={item.href} className={`fev-learning-card fev-learning-card--${item.theme}`}>
            {cardContent}
        </Link>
    ) : (
        <article className={`fev-learning-card fev-learning-card--${item.theme} fev-learning-card--disabled`}>
            {cardContent}
        </article>
    );
}

function StepVisual({ type }: { type: string }) {
    if (type === "subject") {
        return (
            <div className="fev-step-screen fev-step-screen--subject">
                <div className="fev-screen-top"><i /><i /><i /><span>Choose a subject</span></div>
                <div className="fev-screen-subjects">
                    <div className="fev-screen-choice fev-screen-choice--math"><Calculator size={23} /><b>Math</b></div>
                    <div className="fev-screen-choice fev-screen-choice--reading"><BookA size={23} /><b>Reading</b></div>
                </div>
                <small>What would you like to learn?</small>
            </div>
        );
    }

    if (type === "topic") {
        return (
            <div className="fev-step-screen fev-step-screen--topic">
                <div className="fev-screen-top"><i /><i /><i /><span>Choose a topic</span></div>
                <div className="fev-topic-options">
                    <span><b>＋</b> Addition</span>
                    <span><b>ABC</b> Letter Recognition</span>
                    <span><b>♪</b> Phonics</span>
                </div>
                <small>Pick one to get started</small>
            </div>
        );
    }

    if (type === "setup") {
        return (
            <div className="fev-step-screen fev-step-screen--setup">
                <div className="fev-screen-top"><i /><i /><i /><span>Worksheet setup</span></div>
                <div className="fev-setup-row"><span>Level</span><b>Choose level</b></div>
                <div className="fev-setup-row"><span>Difficulty</span><b>Choose difficulty</b></div>
                <div className="fev-setup-count"><span>Questions</span><b>5</b><b>10</b><b>15</b><b>20</b></div>
            </div>
        );
    }

    return (
        <div className="fev-step-screen fev-step-screen--check">
            <div className="fev-screen-top"><i /><i /><i /><span>Try your question</span></div>
            <div className="fev-question-demo">
                <b>3 + 2 = ?</b>
                <div><span>4</span><span className="fev-answer-selected">5</span><span>6</span></div>
            </div>
            <div className="fev-check-demo"><CheckCircle2 size={15} /> Check your answer</div>
        </div>
    );
}

export default function ForEveryonePage() {
    return (
        <main className="fev-page">
            <div className="fev-page-glow fev-page-glow--one" aria-hidden="true" />
            <div className="fev-page-glow fev-page-glow--two" aria-hidden="true" />

            <div className="fev-shell">
                {/* HERO */}
                <section className="fev-hero">
                    <div className="fev-hero__copy">
                        <span className="fev-eyebrow"><Sparkles size={14} /> A PLACE TO LEARN, CREATE & GROW</span>
                        <h1>Little steps today.<br /><span>Big discoveries tomorrow.</span></h1>
                        <p className="fev-hero__lead">
                            A welcoming learning space for children to explore subjects, practise skills and discover new interests — one activity at a time.
                        </p>
                        <div className="fev-hero__actions">
                            <Link href="/math" className="fev-button fev-button--primary">Explore learning <ArrowRight size={17} /></Link>
                            <a href="#fev-how" className="fev-button fev-button--outline">How it works <ChevronDown size={16} /></a>
                        </div>
                        <div className="fev-hero__trust-row">
                            <span><CheckCircle2 size={16} /> Picture-led guidance</span>
                            <span><CheckCircle2 size={16} /> Practice at your pace</span>
                        </div>
                    </div>

                    <div className="fev-hero__visual">
                        <div className="fev-hero__halo" />
                        <div className="fev-hero__image-frame">
                            <Image
                                src="/learning-tree.jpeg"
                                alt="Illustration representing a world of learning for children"
                                width={900}
                                height={900}
                                priority
                                className="fev-hero__image"
                            />
                        </div>
                        <div className="fev-hero-sticker fev-hero-sticker--top">
                            <span className="fev-hero-sticker__icon fev-hero-sticker__icon--sun">✦</span>
                            <span><b>Stay curious</b><small>Every day is a new start</small></span>
                        </div>
                        <div className="fev-hero-sticker fev-hero-sticker--bottom">
                            <span className="fev-hero-sticker__icon fev-hero-sticker__icon--puzzle"><Puzzle size={20} /></span>
                            <span><b>Learn by doing</b><small>Try · practise · grow</small></span>
                        </div>
                        <span className="fev-hero-spark fev-hero-spark--one">✦</span>
                        <span className="fev-hero-spark fev-hero-spark--two">✳</span>
                    </div>
                </section>

                {/* FOUR-PART LEARNING PROMISE */}
                <section className="fev-learning-ribbon" aria-label="Our learning approach">
                    <div><span className="fev-ribbon-icon fev-ribbon-icon--discover"><BookOpen size={18} /></span><b>Discover</b></div>
                    <span className="fev-ribbon-divider" />
                    <div><span className="fev-ribbon-icon fev-ribbon-icon--practise"><PenLine size={18} /></span><b>Practise</b></div>
                    <span className="fev-ribbon-divider" />
                    <div><span className="fev-ribbon-icon fev-ribbon-icon--create"><Paintbrush size={18} /></span><b>Create</b></div>
                    <span className="fev-ribbon-divider" />
                    <div><span className="fev-ribbon-icon fev-ribbon-icon--play"><Puzzle size={18} /></span><b>Play</b></div>
                </section>

                {/* PURPOSE */}
                <section className="fev-purpose" id="fev-about">
                    <div className="fev-purpose__visual">
                        <div className="fev-purpose__scene">
                            <div className="fev-purpose__scene-spark">✦</div>
                            <div className="fev-purpose__paper">
                                <div className="fev-purpose__paper-head"><span>MY LEARNING SPACE</span><Sparkles size={17} /></div>
                                <div className="fev-purpose__paper-grid">
                                    <div className="fev-purpose__mini fev-purpose__mini--math"><Calculator size={23} /><b>Math</b><small>Explore numbers</small></div>
                                    <div className="fev-purpose__mini fev-purpose__mini--reading"><BookOpen size={23} /><b>Reading</b><small>Discover words</small></div>
                                    <div className="fev-purpose__mini fev-purpose__mini--create"><Paintbrush size={23} /><b>Create</b><small>Use imagination</small></div>
                                    <div className="fev-purpose__mini fev-purpose__mini--think"><Brain size={23} /><b>Think</b><small>Solve a puzzle</small></div>
                                </div>
                                <div className="fev-purpose__paper-foot"><Heart size={14} fill="currentColor" /> Small steps make bright futures.</div>
                            </div>
                            <div className="fev-purpose__bubble">🌱</div>
                        </div>
                    </div>
                    <div className="fev-purpose__copy">
                        <span className="fev-section-label">WHY KIDS WORKSHEET</span>
                        <h2>Learning should feel like <span>an adventure.</span></h2>
                        <p>
                            Kids Worksheet brings educational practice and creative exploration together. The goal is to help children build strong foundations, grow confidence and enjoy discovering something new — through clear activities and meaningful practice.
                        </p>
                        <div className="fev-purpose-points">
                            <div><span><Check size={15} /></span><b>Clear learning paths</b><small>Move from a subject to a topic and a worksheet.</small></div>
                            <div><span><Check size={15} /></span><b>Practice with purpose</b><small>Choose suitable activities and question counts.</small></div>
                        </div>
                    </div>
                </section>

                {/* LEARNING RESOURCES */}
                {/* <section className="fev-section fev-learning-section" id="fev-learning">
                    <div className="fev-section-heading">
                        <div>
                            <span className="fev-section-label">EXPLORE YOUR INTERESTS</span>
                            <h2>Choose your <span>learning world.</span></h2>
                            <p>Start with a subject that interests you. More learning areas will join the journey.</p>
                        </div>
                        <span className="fev-section-aside"><Sparkles size={15} /> Start with what you love</span>
                    </div>
                    <div className="fev-learning-grid">
                        {learningItems.map((item) => <LearningCard item={item} key={item.title} />)}
                    </div>
                </section> */}

                {/* HOW IT WORKS - PICTURE FIRST */}
                <section className="fev-how-section" id="fev-how">
                    <div className="fev-how-heading">
                        <span className="fev-section-label">A SIMPLE LEARNING JOURNEY</span>
                        <h2>See it. Try it. <span>Learn it.</span></h2>
                        <p>Children can follow these picture-based steps. Watching a video is never required.</p>
                    </div>
                    <div className="fev-steps-grid">
                        {learningSteps.map((step) => {
                            const Icon = step.icon;
                            return (
                                <article className={`fev-step-card fev-step-card--${step.visual}`} key={step.number}>
                                    <div className="fev-step-card__visual">
                                        <span className="fev-step-card__number">{step.number}</span>
                                        <StepVisual type={step.visual} />
                                    </div>
                                    <div className="fev-step-card__copy">
                                        <span className="fev-step-card__icon"><Icon size={18} /></span>
                                        <h3>{step.title}</h3>
                                        <p>{step.description}</p>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                    <div className="fev-how-footnote"><Lightbulb size={17} /><span>Choose from the available question counts: <b>5, 10, 15 or 20.</b></span></div>
                </section>

                {/* FUN ACTIVITIES */}
                <section className="fev-fun-section" id="fev-fun">
                    <div className="fev-fun-copy">
                        <span className="fev-section-label">A LITTLE MORE PLAYTIME</span>
                        <h2>Make room for <span>imagination.</span></h2>
                        <p>Learning can happen through creativity, playful practice and exciting challenges too. These activity areas are planned additions to the platform.</p>
                        <div className="fev-activity-list">
                            {activityItems.map((activity) => {
                                const Icon = activity.icon;
                                return (
                                    <div className={`fev-activity-row fev-activity-row--${activity.theme}`} key={activity.title}>
                                        <span className="fev-activity-row__icon"><Icon size={22} /></span>
                                        <div><b>{activity.title}</b><small>{activity.text}</small></div>
                                        <span className="fev-activity-row__status">Coming soon</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="fev-fun-art">
                        <div className="fev-fun-art__blob" />
                        <div className="fev-fun-art__main">
                            <div className="fev-fun-art__heading"><Sparkles size={16} /> THE CREATIVE CORNER</div>
                            <div className="fev-fun-art__tiles">
                                <div className="fev-fun-tile fev-fun-tile--paint"><Paintbrush size={27} /><b>Make</b><small>Arts & crafts</small></div>
                                <div className="fev-fun-tile fev-fun-tile--game"><Gamepad2 size={27} /><b>Play</b><small>Learning games</small></div>
                                <div className="fev-fun-tile fev-fun-tile--brain"><Brain size={27} /><b>Think</b><small>Brain challenges</small></div>
                            </div>
                            {/* <div className="fev-fun-art__footer"><Star size={15} fill="currentColor" /> Big ideas grow from little sparks.</div> */}
                        </div>
                        <span className="fev-fun-doodle fev-fun-doodle--one">✦</span>
                        <span className="fev-fun-doodle fev-fun-doodle--two">✳</span>
                    </div>
                </section>

                {/* VIDEO / PROJECT WALKTHROUGH */}
                <section className="fev-video-section" id="fev-video">
                    <div className="fev-video-copy">
                        <span className="fev-section-label">WANT TO SEE IT IN ACTION?</span>
                        <h2>A quick look at <span>the learning experience.</span></h2>
                        <p>Watch the short walkthrough when a video is available, or use the picture guide above to follow each step at your own pace.</p>
                        <div className="fev-video-points">
                            <span><CheckCircle2 size={16} /> Video is optional</span>
                            <span><CheckCircle2 size={16} /> Picture instructions are always available</span>
                        </div>
                        <a href="#fev-how" className="fev-text-link">Follow the picture guide <ArrowRight size={16} /></a>
                    </div>
                    <div className="fev-video-card">
                        <video controls playsInline preload="metadata" poster="/learning-tree.jpeg" className="fev-video-player">
                            <source src="/v2.mp4#t=0.1" type="video/mp4" />
                            Your browser does not support video playback.
                        </video>
                        <div className="fev-video-card__caption"><span><PlayLabel /></span><div><b>Kids Worksheet walkthrough</b><small>Use the controls to play when you are ready.</small></div></div>
                    </div>
                </section>

                {/* FOR KIDS, PARENTS AND TEACHERS */}
                {/* <section className="fev-section fev-audience-section" id="fev-everyone">
                    <div className="fev-section-heading">
                        <div>
                            <span className="fev-section-label">A SPACE FOR EVERYONE</span>
                            <h2>Growing together, <span>learning together.</span></h2>
                            <p>Useful learning resources for children and the adults who encourage them.</p>
                        </div>
                    </div>
                    <div className="fev-audience-grid">
                        {audienceItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <article className={`fev-audience-card fev-audience-card--${item.theme}`} key={item.title}>
                                    <div className="fev-audience-card__top"><span className="fev-audience-card__icon"><Icon size={24} /></span><span>{item.eyebrow}</span></div>
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </article>
                            );
                        })}
                    </div>
                </section> */}

                {/* FAQ */}
                <section className="fev-faq-section" id="fev-faq">
                    <div className="fev-faq-intro">
                        <span className="fev-section-label">GOOD TO KNOW</span>
                        <h2>Questions? <span>Start here.</span></h2>
                        <p>Quick answers for children, parents and teachers getting started.</p>
                    </div>
                    <div className="fev-faq-list">
                        {faqs.map((faq) => (
                            <details className="fev-faq-item" key={faq.question}>
                                <summary><span>{faq.question}</span><ChevronDown size={18} /></summary>
                                <p>{faq.answer}</p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="fev-cta">
                    <div className="fev-cta__decoration fev-cta__decoration--one">✦</div>
                    <div className="fev-cta__decoration fev-cta__decoration--two">✳</div>
                    <span className="fev-cta__eyebrow"><Sparkles size={14} /> YOUR NEXT DISCOVERY IS WAITING</span>
                    <h2>Ready to discover <span>something new?</span></h2>
                    <p>Choose a subject, explore a topic and take your next little step.</p>
                    <Link href="/math" className="fev-button fev-button--cta">Start exploring <ArrowRight size={17} /></Link>
                </section>
            </div>
        </main>
    );
}

function PlayLabel() {
    return <span className="fev-play-label">▶</span>;
}
