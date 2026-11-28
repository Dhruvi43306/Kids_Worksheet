
"use client";

import { useState, FormEvent } from "react";
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Clock,
    GraduationCap,
    Heart,
    HelpCircle,
    Mail,
    MessageCircle,
    Send,
    Sparkles,
    Users
} from "lucide-react";

import "./Contact.css";

const CONTACT_EMAIL =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";

const helpTopics = [
    {
        title: "Worksheet Support",
        description:
            "Need help generating worksheets, selecting question types or checking answers?",
        icon: BookOpen,
        theme: "worksheet"
    },
    {
        title: "Learning Resources",
        description:
            "Have questions about subjects, topics, learning levels or educational activities?",
        icon: GraduationCap,
        theme: "learning"
    },
    {
        title: "Suggestions & Feedback",
        description:
            "Share your ideas and suggestions to help us improve the learning experience.",
        icon: MessageCircle,
        theme: "feedback"
    }
];

const faqs = [
    {
        question: "How can I ask for help with a worksheet?",
        answer:
            "Use the contact form and select Worksheet Support. Explain the issue you are experiencing and include the relevant worksheet or question details."
    },
    {
        question: "Can I suggest a new learning activity?",
        answer:
            "Yes! We welcome suggestions for new subjects, worksheet question types, educational activities and creative learning ideas."
    },
    {
        question: "Who can contact Kids Worksheet?",
        answer:
            "Children, parents, teachers and other visitors can use the contact page to share questions, suggestions or feedback."
    },
    {
        question: "What information should I include in my message?",
        answer:
            "Include a clear subject and explanation of your question. For technical problems, mention the page or activity where you experienced the issue."
    }
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "Worksheet Support",
        message: ""
    });

    const [status, setStatus] = useState("");

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setStatus("");
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!CONTACT_EMAIL) {
            setStatus(
                "The contact email has not been configured yet. Please contact the website administrator."
            );
            return;
        }

        const emailSubject = encodeURIComponent(
            `Kids Worksheet - ${formData.subject}`
        );

        const emailBody = encodeURIComponent(
            `Name: ${formData.name}\n` +
            `Email: ${formData.email}\n` +
            `Topic: ${formData.subject}\n\n` +
            `Message:\n${formData.message}`
        );

        const mailtoLink =
            `mailto:${CONTACT_EMAIL}?subject=${emailSubject}&body=${emailBody}`;

        window.location.href = mailtoLink;

        setStatus(
            "Your email application should open with your message. Please review and send it."
        );
    };

    return (
        <main className="cp-page">
            <div className="cp-container">

                {/* HERO SECTION */}

                <section className="cp-hero">

                    <div className="cp-hero__content">

                        <span className="cp-eyebrow">
                            <Sparkles size={15} />
                            WE ARE HERE TO HELP
                        </span>

                        <h1>
                            Let's Start a
                            <span> Conversation!</span>
                        </h1>

                        <p>
                            Have a question, need help with a worksheet
                            or want to share an idea? We would love to
                            hear from you. Your thoughts help us create
                            a better learning experience for everyone.
                        </p>

                        <div className="cp-hero__features">

                            <span>
                                <CheckCircle2 size={17} />
                                Questions & Support
                            </span>

                            <span>
                                <CheckCircle2 size={17} />
                                Ideas & Suggestions
                            </span>

                        </div>

                        <a
                            href="#cp-contact-form"
                            className="cp-primary-button"
                        >
                            Send Us a Message
                            <ArrowRight size={18} />
                        </a>

                    </div>

                    <div className="cp-hero__visual">

                        <div className="cp-hero__background"></div>

                        <div className="cp-hero__illustration">

                            <div className="cp-illustration-card cp-illustration-card--main">
                                <div className="cp-illustration-card__icon">
                                    <MessageCircle size={42} />
                                </div>

                                <h3>We'd Love to Hear From You!</h3>

                                <p>
                                    Every question and idea matters.
                                </p>

                                <div className="cp-illustration-stars">
                                    <Sparkles size={20} />
                                    <Heart size={19} />
                                    <StarIcon />
                                </div>
                            </div>

                            <div className="cp-floating cp-floating--one">
                                <Mail size={22} />
                            </div>

                            <div className="cp-floating cp-floating--two">
                                <Heart size={22} />
                            </div>

                            <div className="cp-floating cp-floating--three">
                                <Sparkles size={22} />
                            </div>

                        </div>
                    </div>

                </section>


                {/* CONTACT FORM AND INFORMATION */}

                <section
                    className="cp-contact-section"
                    id="cp-contact-form"
                >

                    <div className="cp-contact-intro">

                        <span className="cp-eyebrow">
                            <Mail size={15} />
                            GET IN TOUCH
                        </span>

                        <h2>
                            How Can We <span>Help You?</span>
                        </h2>

                        <p>
                            Send us a message using the form.
                            Choose the topic that best describes
                            your question so we can understand
                            how to help.
                        </p>

                        <div className="cp-contact-side">

                            <div className="cp-contact-side__icon">
                                <MessageCircle size={23} />
                            </div>

                            <div>
                                <h3>Have something to share?</h3>
                                <p>
                                    Questions, suggestions and feedback
                                    are all welcome.
                                </p>
                            </div>

                        </div>

                        <div className="cp-contact-side">

                            <div className="cp-contact-side__icon cp-contact-side__icon--green">
                                <Heart size={23} />
                            </div>

                            <div>
                                <h3>Help us grow</h3>
                                <p>
                                    Your feedback can help make
                                    learning more enjoyable.
                                </p>
                            </div>

                        </div>

                        <div className="cp-contact-email">

                            <div className="cp-contact-email__icon">
                                <Mail size={20} />
                            </div>

                            <div>
                                <span>EMAIL ADDRESS</span>

                                <strong>
                                    {CONTACT_EMAIL ||
                                        "Contact email to be configured"}
                                </strong>
                            </div>

                        </div>

                    </div>


                    {/* CONTACT FORM */}

                    <div className="cp-form-card">

                        <div className="cp-form-card__heading">

                            <div>
                                <h3>Send Us a Message</h3>

                                <p>
                                    Fill in the details below.
                                </p>
                            </div>

                            <div className="cp-form-card__icon">
                                <Send size={23} />
                            </div>

                        </div>

                        <form
                            className="cp-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="cp-form-group">

                                <label htmlFor="cp-name">
                                    Your Name
                                    <span>*</span>
                                </label>

                                <input
                                    id="cp-name"
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    maxLength={100}
                                />

                            </div>


                            <div className="cp-form-group">

                                <label htmlFor="cp-email">
                                    Email Address
                                    <span>*</span>
                                </label>

                                <input
                                    id="cp-email"
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    maxLength={254}
                                />

                            </div>


                            <div className="cp-form-group">

                                <label htmlFor="cp-subject">
                                    What Can We Help You With?
                                    <span>*</span>
                                </label>

                                <select
                                    id="cp-subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Worksheet Support">
                                        Worksheet Support
                                    </option>

                                    <option value="Learning Resources">
                                        Learning Resources
                                    </option>

                                    <option value="Technical Issue">
                                        Technical Issue
                                    </option>

                                    <option value="Suggestions & Feedback">
                                        Suggestions & Feedback
                                    </option>

                                    <option value="General Enquiry">
                                        General Enquiry
                                    </option>
                                </select>

                            </div>


                            <div className="cp-form-group">

                                <label htmlFor="cp-message">
                                    Your Message
                                    <span>*</span>
                                </label>

                                <textarea
                                    id="cp-message"
                                    name="message"
                                    rows={5}
                                    placeholder="Tell us how we can help..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    maxLength={3000}
                                />

                                <small>
                                    {formData.message.length}/3000 characters
                                </small>

                            </div>


                            <button
                                type="submit"
                                className="cp-submit-button"
                            >
                                Send Message
                                <Send size={17} />
                            </button>

                            {status && (
                                <p
                                    className="cp-form-status"
                                    role="status"
                                >
                                    {status}
                                </p>
                            )}

                            <p className="cp-form-note">
                                <Heart size={13} />
                                We appreciate you getting in touch!
                            </p>

                        </form>

                    </div>

                </section>


                {/* REASONS TO CONTACT */}

                <section className="cp-help-section">

                    <div className="cp-section-heading">

                        <span className="cp-eyebrow">
                            <HelpCircle size={15} />
                            HOW CAN WE SUPPORT YOU?
                        </span>

                        <h2>
                            We're Here for <span>Every Learning Journey</span>
                        </h2>

                        <p>
                            Choose the kind of help or feedback
                            you would like to share with us.
                        </p>

                    </div>


                    <div className="cp-help-grid">

                        {helpTopics.map((topic) => {
                            const Icon = topic.icon;

                            return (
                                <article
                                    className={`cp-help-card cp-help-card--${topic.theme}`}
                                    key={topic.title}
                                >

                                    <div className="cp-help-card__icon">
                                        <Icon size={27} />
                                    </div>

                                    <h3>{topic.title}</h3>

                                    <p>{topic.description}</p>

                                    <a href="#cp-contact-form">
                                        Contact Us
                                        <ArrowRight size={16} />
                                    </a>

                                </article>
                            );
                        })}

                    </div>

                </section>


                {/* WHO CAN CONTACT US */}

                <section className="cp-community-section">

                    <div className="cp-section-heading">

                        <span className="cp-eyebrow">
                            <Users size={15} />
                            OUR LEARNING COMMUNITY
                        </span>

                        <h2>
                            This Space Is <span>For Everyone!</span>
                        </h2>

                        <p>
                            We welcome questions and ideas from
                            everyone who is part of our learning
                            community.
                        </p>

                    </div>


                    <div className="cp-community-grid">

                        <div className="cp-community-card">
                            <div className="cp-community-icon cp-community-icon--kids">
                                <Heart size={25} />
                            </div>

                            <h3>Kids</h3>

                            <p>
                                Have a question about an activity
                                or worksheet? Share it with us.
                            </p>
                        </div>


                        <div className="cp-community-card">
                            <div className="cp-community-icon cp-community-icon--parents">
                                <Users size={25} />
                            </div>

                            <h3>Parents</h3>

                            <p>
                                Share your feedback and questions
                                about your child's learning experience.
                            </p>
                        </div>


                        <div className="cp-community-card">
                            <div className="cp-community-icon cp-community-icon--teachers">
                                <GraduationCap size={25} />
                            </div>

                            <h3>Teachers</h3>

                            <p>
                                Suggest educational resources,
                                worksheet ideas and learning activities.
                            </p>
                        </div>

                    </div>

                </section>


                {/* FAQ SECTION */}

                <section className="cp-faq-section">

                    <div className="cp-section-heading">

                        <span className="cp-eyebrow">
                            <HelpCircle size={15} />
                            QUICK ANSWERS
                        </span>

                        <h2>
                            Frequently Asked <span>Questions</span>
                        </h2>

                        <p>
                            Some helpful answers before you
                            send us a message.
                        </p>

                    </div>


                    <div className="cp-faq-list">

                        {faqs.map((faq) => (
                            <details
                                className="cp-faq-item"
                                key={faq.question}
                            >

                                <summary>
                                    {faq.question}

                                    <span>
                                        <ArrowRight size={17} />
                                    </span>
                                </summary>

                                <p>{faq.answer}</p>

                            </details>
                        ))}

                    </div>

                </section>


                {/* BOTTOM BANNER */}

                <section className="cp-bottom-banner">

                    <div className="cp-bottom-banner__decoration">
                        ✦
                    </div>

                    <div className="cp-bottom-banner__icon">
                        <Heart size={29} />
                    </div>

                    <h2>
                        Your Ideas Make Learning Better!
                    </h2>

                    <p>
                        Every question, suggestion and new idea
                        helps us make Kids Worksheet a more
                        enjoyable place to learn.
                    </p>

                    <a
                        href="#cp-contact-form"
                        className="cp-bottom-button"
                    >
                        Let's Talk
                        <ArrowRight size={17} />
                    </a>

                </section>

            </div>
        </main>
    );
}

function StarIcon() {
    return <Sparkles size={19} />;
}
