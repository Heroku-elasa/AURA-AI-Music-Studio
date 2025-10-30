import React, { createContext, useContext, useState } from 'react';

// This is a mock implementation for demonstration purposes.
// In a real application, you would use a library like i18next and load translations from JSON files.
const translations: Record<string, any> = {
    en: {
        header: {
            home: "Home",
            musicGeneration: "AI Music Analysis",
            songIdeaGenerator: "AI Song Idea Generator",
            musicSheetGenerator: "Sheet Music AI",
            instrumentFinder: "Instrument Finder",
            aiTutor: "AI Music Tutor",
            musicTrends: "Music Trends",
            ourProducers: "Our Producers",
            collaboration: "Collaboration",
            myProjects: "My Projects",
            login: "Login / Sign Up",
            logout: "Logout",
        },
        searchModal: {
            title: "AURA AI Search",
            placeholder: "Search for instruments, producers, genres...",
            searchButton: "Search",
            suggestionsTitle: "Popular Searches",
            suggestionQueries: ["Generate Lo-fi Beat", "Find guitar shops", "What is a I-V-vi-IV progression?", "Travis Scott type beat"],
            resultsTitle: "Search Results",
            noResults: "No relevant results found. Try a different search term.",
            viewResult: "View",
        },
        hero: {
            title: "Your AI-Powered Music Studio",
            subtitle: "Generate melodies, get personalized production advice, and find local music stores and studios—all with the help of our advanced AI.",
            button1: "Start Creating Music",
            button2: "Meet Our Producers",
            servicesTitle: "Our Creative Services",
            servicesSubtitle: "We offer a comprehensive range of AI tools to help you compose, produce, and share your music with the world.",
            services: [
                { "icon": "idea", "title": "Song Idea Generator", "description": "Describe a mood or theme and get a complete musical concept with instruments and production tips.", "targetPage": "song_idea_generator" },
                { "icon": "melody", "title": "Comprehensive Analysis", "description": "Get a deep analysis of your musical idea, including theory, arrangement, and cost estimates.", "targetPage": "music_generation" },
                { "icon": "sheet_music", "title": "Sheet Music Generator", "description": "Describe a melody and get it transcribed into sheet music using our AI notation tool.", "targetPage": "music_sheet_generator" },
                { "icon": "lyrics", "title": "Lyric Assistant", "description": "Overcome writer's block with an AI partner that helps you write compelling lyrics.", "targetPage": "music_generation" },
                { "icon": "chords", "title": "Chord Progressions", "description": "Generate harmonically rich chord progressions in any key or genre.", "targetPage": "music_generation" },
                { "icon": "drums", "title": "Drum Pattern Maker", "description": "Create intricate drum beats and rhythms for any style, from hip-hop to rock.", "targetPage": "music_generation" },
                { "icon": "mastering", "title": "AI Mastering", "description": "Get an instant audio master to make your tracks sound loud, clear, and ready for release.", "targetPage": "music_generation" },
                { "icon": "remix", "title": "Remix Tool", "description": "Upload a track and get AI-generated remix ideas and stems to work with.", "targetPage": "music_generation" },
                { "icon": "art", "title": "Album Art Generator", "description": "Create stunning, AI-generated cover art for your singles and albums.", "targetPage": "music_generation" },
                { "icon": "collab", "title": "Collaboration Finder", "description": "Connect with other artists and producers based on your genre and style.", "targetPage": "collaboration" },
                { "icon": "health", "title": "App Status", "description": "All systems are running smoothly. The application is healthy and ready to create.", "targetPage": "home" }
            ],
            aiExplanation: {
                title: "AI-Powered Music Creation at AURA",
                subtitle: "Explore the advanced AI features that enable personalized, predictive, and precise music production.",
                points: [
                    { "title": "1. Algorithmic Composition", "description": "Our AI analyzes musical patterns, theory, and trends to generate original melodies, chord progressions, and drum patterns. It can adapt to various genres, moods, and complexities." },
                    { "title": "2. Lyric & Theme Generation", "description": "Using advanced language models, the AI can help you brainstorm lyrical themes, write verses and choruses, and even suggest rhyming schemes based on a given concept." },
                    { "title": "3. Instrument & Sound Design", "description": "The AI recommends specific virtual instruments (VSTs) and synthesizer patches that fit your chosen genre and mood, helping you build a cohesive sound palette." },
                    { "title": "4. Smart Arrangement", "description": "Based on genre conventions, the AI can suggest song structures (e.g., Intro-Verse-Chorus-Verse-Chorus-Bridge-Outro) and help you arrange your generated parts into a full track." },
                    { "title": "5. AI Audio Mastering", "description": "Our mastering AI analyzes your mix and applies intelligent EQ, compression, and limiting to optimize loudness and clarity for streaming platforms like Spotify and Apple Music." },
                    { "title": "6. Market Trend Analysis", "description": "By grounding its knowledge in Google Search, the AI can analyze current music charts and trends to give you insights into what's popular, helping you make informed creative decisions." },
                    { "title": "7. Production Cost Estimation", "description": "The AI can generate a hypothetical cost breakdown for producing a track, including estimates for studio time, session musicians, mixing, and mastering services." },
                    { "title": "8. Music Theory Tutor", "description": "Our conversational AI acts as a music tutor, capable of answering your questions about music theory, production techniques, and music history in a clear and understandable way." }
                ]
            },
            homePageAdditions: {
                testimonialsTitle: "What Artists Say",
                testimonialsSubtitle: "Real stories from creators who have experienced the AURA difference.",
                testimonials: [
                    { "quote": "The AI melody generator is insane. I was stuck on a track for weeks, and AURA gave me the perfect hook in seconds.", "name": "DJ Alex", "treatment": "Melody Generation" },
                    { "quote": "AURA has completely transformed my workflow. The AI Mastering tool saved me hundreds of dollars and my tracks sound amazing.", "name": "Lila K.", "treatment": "AI Mastering" },
                    { "quote": "As a beginner, the AI Music Tutor has been a game-changer. I'm finally understanding music theory.", "name": "David L.", "treatment": "AI Music Tutor" }
                ],
                featuredDoctorTitle: "Meet Our Lead Producer",
                featuredDoctorSubtitle: "Our team is composed of industry veterans and award-winning producers.",
                featuredDoctor: {
                    "name": "Anousheh",
                    "specialty": "Lead Producer & Sound Designer",
                    "bio": "With over 15 years of experience producing for major artists, Anousheh is a pioneer in blending traditional techniques with cutting-edge AI tools. She is dedicated to empowering artists to create their best work."
                },
                featuredDoctorButton: "Meet The Entire Team"
            },
        },
        musicSheetGenerator: {
            title: "AI Sheet Music Generator",
            subtitle: "Turn your musical ideas into readable sheet music. Describe a melody, mood, or progression, and let the AI write the notes for you.",
            promptLabel: "Describe your musical idea",
            promptPlaceholder: "e.g., A simple and happy folk melody in G Major, suitable for a flute.",
            suggestions: [
                "A slow, sad waltz in A minor for piano.",
                "A fast, energetic celtic jig.",
                "'Twinkle Twinkle Little Star' melody.",
                "A short, mysterious theme in C harmonic minor."
            ],
            buttonText: "Generate Sheet Music",
            generating: "Generating...",
            resultsTitle: "Generated Sheet Music",
            abcNotationTitle: "ABC Notation Code",
            copyButton: "Copy Code",
            copySuccess: "Copied!",
            placeholder: "Your generated sheet music will appear here.",
            error: "Sorry, I couldn't generate sheet music for that idea. Please try a different description.",
            engineLabel: "Generation Engine",
            engineMusic21: "Music21",
            engineMusic21Desc: "Overall best choice. For parsing, analysis, and generation.",
            engineLilypond: "LilyPond",
            engineLilypondDesc: "Highest-quality engraving for publication-standard scores.",
            engineAbjad: "Abjad",
            engineAbjadDesc: "For algorithmic composition and complex contemporary scores.",
        },
        myProjectsPage: {
            title: "My Saved Projects",
            subtitle: "Review, restore, or delete your past AI-generated music sessions.",
            restore: "View Project",
            delete: "Delete",
            savedOn: "Saved on",
            emptyTitle: "No projects saved",
            emptyText: "Your saved AI music projects will appear here.",
            goBackButton: "Start a New Project",
        },
        footer: {
            description: "Your AI-powered assistant for music creation, production, and analysis.",
            copyright: "© 2024 AURA. All Rights Reserved.",
        },
        quotaErrorModal: {
            title: "Quota Exceeded",
            body: "You have exceeded your API quota. Please check your billing status or try again later. AI features are temporarily unavailable.",
            cta: "Check Billing",
            close: "Close",
        },
        loginModal: {
            title: "Login to Your Studio",
            google: "Continue with Google",
            facebook: "Continue with Facebook",
            instagram: "Continue with Instagram",
            or: "OR",
            emailPlaceholder: "Enter your email",
            passwordPlaceholder: "Enter your password",
            loginButton: "Login",
        },
        aiTutor: {
            title: "AI Music Tutor",
            subtitle: "Ask me anything about music theory, production, or songwriting. I'm here to help you on your creative journey.",
            placeholder: "Type your question here...",
        },
        musicTrends: {
            title: "Music Market Trends Analyzer",
            subtitle: "Enter a topic to get the latest market insights, genre trends, and analyses powered by Google Search.",
            searchPlaceholder: "e.g., 'lo-fi hip hop trends in 2024'",
            suggestionsTitle: "Or try one of these topics:",
            suggestions: [
                "Future of Pop music",
                "Rise of Amapiano genre",
                "TikTok's impact on music charts",
                "Vinyl records sales trend"
            ],
            searching: "Analyzing...",
            searchButton: "Analyze",
            placeholder: "Your market analysis will appear here.",
            loading: {
                scanning: "Scanning search results...",
                synthesizing: "Synthesizing information...",
                extracting: "Extracting key insights...",
                compiling: "Compiling your report...",
            },
            analysisModes: {
                quick: "Quick Summary",
                "in-depth": "In-depth Analysis",
                swot: "SWOT Analysis",
            },
            results: {
                keyInsights: "Key Insights",
                detailedSummary: "Detailed Summary",
                emergingTrends: "Emerging Trends",
                opportunities: "Opportunities",
                risks: "Risks",
                strengths: "Strengths",
                weaknesses: "Weaknesses",
                threats: "Threats",
            },
            sources: "Sources",
            relatedTopics: "Related Topics",
        },
        ourProducers: {
            title: "Meet Our Expert Producers",
            subtitle: "Our studio is proud to have a team of highly qualified and experienced producers dedicated to sonic excellence.",
            tableHeaders: { "name": "Name", "specialty": "Primary Genre", "bio": "Bio", "license": "Top Credits" },
            doctors: [
                { "name": "Anousheh", "specialty": "Synthwave, Electronic", "bio": "Specializes in analog synth sound design and atmospheric production, with over 15 years of experience.", "licenseNumber": "Starlight Drive (Album)" },
                { "name": "Ben Carter", "specialty": "Hip-Hop, Trap", "bio": "Expert in modern drum programming and sample-based production, focusing on radio-ready hits.", "licenseNumber": "City Lights (Single)" },
                { "name": "Ava Nazari", "specialty": "Orchestral, Film Score", "bio": "Focuses on large-scale orchestral arrangements and emotional scoring for film and games.", "licenseNumber": "The Last Kingdom (Score)" }
            ],
        },
        collaborationPage: {
            title: "Collaboration & Label Submissions",
            goalTitle: "Our Goal",
            "goalText": "We are seeking talented artists and collaborators to join our creative ecosystem. Our mission is to democratize access to professional production tools and label opportunities through technology.",
            canvasTitle: "Our Vision",
            canvasItems: {
                "item1": "Launch 10 new artists on major streaming platforms within 2 years.",
                "item2": "Further develop our AI music generation models for richer, more complex compositions.",
                "item3": "Integrate real-time collaboration features for remote co-production.",
                "item4": "Establish a certified training program for aspiring music producers worldwide."
            },
            statusTitle: "Current Status",
            "progressLabel": "Open for Submissions",
            "statusText": "We are actively listening to demos and seeking new talent to sign to AURA Records.",
            methodsTitle: "Get Involved",
            crowdfundingTitle: "Community Funding (Future)",
            "crowdfundingText": "A token-based crowdfunding campaign is planned for Q4 2024 to allow our community to invest in our signed artists.",
            buyTokenButton: "Coming Soon",
            seedTitle: "Submit Your Demo",
            "seedText": "We welcome artists of all genres to submit their best work for consideration by our A&R team. Please review our submission guidelines and use the portal to send us your tracks.",
            viewContractButton: "View Submission Guidelines",
            contactWhatsAppButton: "Submit via Demo Portal",
            franchiseTitle: "Start Your Own Studio",
            "franchiseText": "Interested in running an AURA-powered studio? We are expanding our global presence through a partnership model that combines our advanced AI technology with your local expertise.",
            franchiseButton: "Explore Studio Partnership",
        },
        franchisePage: {
            title: "Become an AURA Studio Partner",
            subtitle: "Bring the future of AI-powered music production to your city. Join a network of innovators shaping the industry.",
            canvasTitle: "Our Business Model Canvas",
            "canvasSubtitle": "A proven framework for success, supported by our cutting-edge technology and brand.",
            canvasItems: {
                valueProposition: { title: "Value Proposition", description: "AI-driven composition tools, personalized production workflows, premium branding, and exclusive access to our technology platform." },
                targetMarket: { title: "Target Market", description: "Independent artists, songwriters, and producers seeking high-end, efficient, and creative music production solutions." },
                revenueStreams: { title: "Revenue Streams", description: "Subscription fees for AI tools, royalties from released tracks, and premium production/mixing services." },
                keyResources: { title: "Key Resources", description: "Proprietary AI software, certified training programs, brand assets, and a centralized project management system." },
                marketingSupport: { title: "Marketing & Support", description: "Global marketing campaigns, local promotional toolkits, operational support, and continuous technology updates." },
                partnershipModel: { title: "Partnership Model", description: "A collaborative partnership where we provide the technology and brand, and you provide the local operational excellence." }
            },
            "teamBuildingTitle": "Building Your Production Team",
            "teamBuildingSubtitle": "We provide comprehensive training to ensure your team meets the AURA standard of excellence.",
            teamRoles: [
                { role: "Studio Manager", description: "Oversees daily operations, client bookings, and artist satisfaction." },
                { role: "Lead Producer / Engineer", description: "Head creative professional responsible for sessions and performing advanced production tasks." },
                { role: "AI Music Specialist", description: "Manages the AI tools, artist data, and ensures seamless tech integration in the workflow." },
                { role: "Client Coordinator", description: "The first point of contact for artists, managing bookings and project timelines." }
            ],
            "nextStepsTitle": "Your Journey Starts Here",
            "nextStepsSubtitle": "Take the first step towards owning an AURA studio by securing your position with a partnership token.",
            "tokenPurchaseTitle": "Acquire Your Studio Token",
            "tokenPurchaseDescription": "Purchasing a studio token grants you exclusive access to our detailed investment prospectus, a one-on-one session with our expansion team, and priority consideration for your chosen territory. This is a fully refundable deposit.",
            purchaseButton: "Purchase Studio Token",
            contactButton: "Contact Our Team",
        },
        songIdeaGenerator: {
            title: "AI Song Idea Generator",
            subtitle: "Describe a mood, theme, or story, and our AI will help you craft a complete musical concept.",
            descriptionLabel: "Describe your idea",
            descriptionPlaceholder: "e.g., 'A melancholic song about walking through a city in the rain at night. Something like a lo-fi hip hop beat.'",
            suggestionsTitle: "Or, start with one of these ideas:",
            suggestions: [
                "An upbeat, funky track for a summer road trip.",
                "A dark, cinematic orchestral piece for a movie scene.",
                "A simple, acoustic ballad about lost love.",
                "An energetic 80s-style synthwave track for driving."
            ],
            analyzing: "Generating...",
            buttonText: "Generate Song Idea",
            placeholder: "Your song concept will be displayed here.",
            analysisTitle: "Song Idea Report",
            keyCharacteristics: "Key Characteristics",
            recommendedIngredients: "Recommended Instruments",
            ingredientsToAvoid: "Instruments to Avoid",
            actionableSuggestions: "Production Suggestions",
        },
        instrumentFinder: {
            title: "Find Music Gear & Studios",
            subtitle: "Locate the nearest instrument shop or recording studio for your needs.",
            "searchPlaceholder": "Search by city, instrument, or studio name...",
            suggestionsTitle: "Try searching for:",
            suggestions: [
                "Fender guitars in New York",
                "Recording studios with analog gear",
                "Vintage synthesizers",
                "Beginner drum kits"
            ],
            "searchButtonText": "Search",
            "or": "OR",
            "geoSearchButton": "Find Gear Near Me",
            "searching": "Searching...",
            "placeholder": "Search results will appear here.",
            "resultsTitle": "Our Partners",
            "services": "Services Offered",
            "searchTypeLabel": "I'm looking for:",
            "searchTypeClinics": "Stores",
            "searchTypeDoctors": "Studios",
        },
        musicGeneration: {
            title: "Comprehensive AI Analysis",
            subtitle: "Describe your musical idea, and our AI will provide a deep creative analysis, including theory, arrangement, cost estimates, and more.",
            "saveButton": "Save Project",
        },
        musicIdeaForm: {
            title: "Describe Your Idea",
            "symptomsLabel": "Describe the mood, genre, tempo, and any lyrical ideas.",
            "symptomsPlaceholder": "e.g., 'I want to create a slow, emotional piano track in a minor key. The lyrics should be about nostalgia and looking back at old photos.'",
            "voiceInputStart": "Start voice input",
            "voiceInputStop": "Stop voice input",
            "detailsTitle": "Additional Details (Optional)",
            "aggravatingFactors": "Reference artists or songs?",
            "alleviatingFactors": "Specific instruments to include?",
            "duration": "Target song length?",
            "durationPlaceholder": "e.g., 3 minutes, 4:30",
            "previousTreatments": "DAW or software you're using?",
            "medications": "Any existing melodies or lyrics?",
            "buttonText": "Get Comprehensive Analysis",
            "validationError": "Please describe your idea before analyzing.",
            "culturalPromptsTitle": "Or, start with one of these vibes:",
        },
        analysisDisplay: {
            analysisTitle: "Comprehensive Music Analysis",
            "generating": "Analyzing your idea with AI...",
            "placeholder1": "Your analysis will appear here.",
            "placeholder2": "Fill out the form to get started.",
            "specialistsTitle": "Recommended Producers",
            "conditionsTitle": "Suggested Song Elements",
            "findSpecialistsButton": "Find a producer near you",
            "viewDetails": "View Details",
            "hideDetails": "Hide Details",
            "academicAnalysisButton": "Get Music Theory Info",
            "requestResearchButton": "Request New Feature",
            "loadingDetails": "Loading details...",
            "loadingAcademicAnalysis": "Searching for music theory information...",
            "lowConfidenceFallback": "The AI has low confidence in these results. They are provided for creative inspiration only.",
            "treatmentSectionTitle": "AI-Suggested Next Steps",
            "lifestyleTitle": "Arrangement & Production Advice",
            "songStructureTitle": "Suggested Song Structure",
            "treatmentSuggestionsTitle": "Suggested Initial Techniques",
            "followUpTitle": "Questions to Ask Yourself",
            "prepareSummaryButton": "Prepare Production Brief",
            "generatingSummary": "Generating brief...",
            "copySuccess": "Copied!",
            "skinProfileTitle": "Song Profile",
            "makeupStyleTitle": "Genre & Style Suggestion",
            "homemadeMaskTitle": "Generated Melody/Lyric Idea",
            "keyProducts": "Key Elements",
            "ingredients": "Elements",
            "instructions": "Instructions",
            "costAnalysisTitle": "AI-Generated Production Cost Estimate",
            "calculatingCosts": "Calculating Costs...",
            "calculateCostsButton": "Calculate Estimated Costs",
            "tableHeaderItem": "Service / Item",
            "tableHeaderCost": "Estimated Cost",
            "tableHeaderUnit": "Unit",
            "tableHeaderTotal": "Total Estimated Cost",
            "currency": "USD",
        },
        treatmentSummary: {
            title: "Production Brief",
            "style": "Style",
            "modernDark": "Modern Dark",
            "classicLight": "Classic Light",
            "copyBio": "Copy Brief",
            "namePlaceholder": "Project Brief",
            "locationPlaceholder": "Generated by AURA AI",
        },
        producerFinder: {
            title: "Find a Producer",
            subtitle: "Based on your analysis, here are some producers who may be a good fit.",
            "maxResults": "Max Results",
            "finding": "Finding producers...",
            "findButton": "Find Producers",
            "validationError": "Complete the analysis first to find relevant producers.",
            "savedTitle": "Saved Producers",
            "clearAll": "Clear All",
            "bio": "Bio",
            "specialty": "Genre",
            "relevance": "Relevance",
            "notesLabel": "My Notes",
            "notesPlaceholder": "e.g., 'Email on Monday about mixing.'",
            "remove": "Remove",
            "crateTitle": "Search Results",
            "crateSubtitle": "Save producers you're interested in.",
            "clearCrate": "Clear Results",
            "rankBy": "Rank by",
            sort: {
                relevance: "Relevance",
                city: "City",
                name: "Name",
            },
            "saved": "Saved",
            "save": "Save",
            "parseErrorTitle": "Could not read AI response",
            "parseErrorSubtitle": "The AI returned data in an unexpected format. Here is the raw text:",
            "crateEmpty": "No producers found. Try adjusting your search."
        }
    },
    fa: {
        header: { home: "خانه", musicGeneration: "تحلیل جامع با AI", songIdeaGenerator: "ایده آهنگ با AI", musicSheetGenerator: "نت نویسی با AI", instrumentFinder: "ساز یاب", aiTutor: "مربی هوش مصنوعی", musicTrends: "ترندهای موسیقی", ourProducers: "تهیه‌کنندگان ما", collaboration: "همکاری", myProjects: "پروژه‌های من", login: "ورود / ثبت نام", logout: "خروج" },
        searchModal: {
            title: "جستجوی هوش مصنوعی AURA",
            placeholder: "جستجو برای سازها، تهیه‌کنندگان، ژانرها...",
            searchButton: "جستجو",
            suggestionsTitle: "جستجوهای محبوب",
            suggestionQueries: ["ساخت بیت Lo-fi", "پیدا کردن فروشگاه گیتار", "آکورد I-V-vi-IV چیست؟", "بیت سبک Travis Scott"],
            resultsTitle: "نتایج جستجو",
            noResults: "نتیجه مرتبطی یافت نشد. عبارت دیگری را امتحان کنید.",
            viewResult: "مشاهده",
        },
        hero: { 
            title: "استودیوی موسیقی شما با قدرت هوش مصنوعی", 
            subtitle: "ملودی بسازید، مشاوره تهیه‌کنندگی شخصی دریافت کنید و فروشگاه‌ها و استودیوهای موسیقی محلی را پیدا کنید - همه با کمک هوش مصنوعی پیشرفته ما.", 
            button1: "شروع ساخت موسیقی", 
            button2: "آشنایی با تهیه‌کنندگان ما", 
            servicesTitle: "خدمات خلاقانه ما",
            servicesSubtitle: "ما طیف گسترده‌ای از ابزارهای هوش مصنوعی را برای کمک به شما در آهنگسازی، تولید و به اشتراک‌گذاری موسیقی خود با جهان ارائه می‌دهیم.",
            services: [
                { "icon": "idea", "title": "مولد ایده آهنگ", "description": "یک حالت یا تم را توصیف کنید و یک مفهوم موسیقی کامل با سازها و نکات تولید دریافت کنید.", "targetPage": "song_idea_generator" },
                { "icon": "melody", "title": "تحلیل جامع", "description": "تحلیل عمیقی از ایده موسیقی خود، شامل تئوری، تنظیم و تخمین هزینه دریافت کنید.", "targetPage": "music_generation" },
                { "icon": "sheet_music", "title": "مولد نت موسیقی", "description": "یک ملودی را توصیف کنید و آن را با ابزار نت‌نویسی هوش مصنوعی ما به نت تبدیل کنید.", "targetPage": "music_sheet_generator" },
                { "icon": "lyrics", "title": "دستیار ترانه", "description": "با یک همکار هوش مصنوعی که به شما در نوشتن اشعار جذاب کمک می‌کند، بر بن‌بست نویسنده غلبه کنید.", "targetPage": "music_generation" },
                { "icon": "chords", "title": "توالی آکورد", "description": "توالی آکوردهای غنی از نظر هارمونیک در هر کلید یا ژانری ایجاد کنید.", "targetPage": "music_generation" },
                { "icon": "drums", "title": "سازنده الگوی درام", "description": "ضرب‌ها و ریتم‌های درام پیچیده برای هر سبکی، از هیپ‌هاپ تا راک، ایجاد کنید.", "targetPage": "music_generation" },
                { "icon": "mastering", "title": "مسترینگ با هوش مصنوعی", "description": "یک مسترینگ صوتی فوری دریافت کنید تا آهنگ‌های شما بلند، واضح و آماده انتشار شوند.", "targetPage": "music_generation" },
                { "icon": "remix", "title": "ابزار ریمیکس", "description": "یک آهنگ را آپلود کنید و ایده‌های ریمیکس و استم‌های تولید شده توسط هوش مصنوعی را برای کار دریافت کنید.", "targetPage": "music_generation" },
                { "icon": "art", "title": "مولد کاور آلبوم", "description": "کاورهای هنری خیره‌کننده و تولید شده توسط هوش مصنوعی برای تک‌آهنگ‌ها و آلبوم‌های خود ایجاد کنید.", "targetPage": "music_generation" },
                { "icon": "collab", "title": "یابنده همکار", "description": "بر اساس ژانر و سبک خود با هنرمندان و تهیه‌کنندگان دیگر ارتباط برقرار کنید.", "targetPage": "collaboration" },
                { "icon": "health", "title": "وضعیت برنامه", "description": "تمام سیستم‌ها به درستی کار می‌کنند. برنامه سالم و آماده خلق است.", "targetPage": "home" }
            ],
            aiExplanation: {
                title: "خلق موسیقی با هوش مصنوعی در AURA",
                subtitle: "ویژگی‌های پیشرفته هوش مصنوعی را که تولید موسیقی شخصی، پیش‌بینی‌کننده و دقیق را ممکن می‌سازد، کاوش کنید.",
                points: [
                    { "title": "۱. آهنگسازی الگوریتمی", "description": "هوش مصنوعی ما الگوهای موسیقی، تئوری و ترندها را برای تولید ملودی‌ها، توالی آکوردها و الگوهای درام اصلی تجزیه و تحلیل می‌کند. این هوش مصنوعی می‌تواند با ژانرها، حالت‌ها و پیچیدگی‌های مختلف سازگار شود." },
                    { "title": "۲. تولید شعر و تم", "description": "با استفاده از مدل‌های زبان پیشرفته، هوش مصنوعی می‌تواند به شما در طوفان فکری تم‌های ترانه، نوشتن ورس‌ها و کروس‌ها و حتی پیشنهاد طرح‌های قافیه بر اساس یک مفهوم مشخص کمک کند." },
                    { "title": "۳. طراحی ساز و صدا", "description": "هوش مصنوعی سازهای مجازی خاص (VST) و پچ‌های سینت سایزر را که با ژانر و حالت انتخابی شما مطابقت دارند، توصیه می‌کند و به شما در ساخت یک پالت صدای منسجم کمک می‌کند." },
                    { "title": "۴. تنظیم هوشمند", "description": "بر اساس قراردادهای ژانر، هوش مصنوعی می‌تواند ساختارهای آهنگ (مانند مقدمه-ورس-کروس-ورس-کروس-پل-پایانی) را پیشنهاد دهد و به شما در تنظیم بخش‌های تولید شده خود در یک آهنگ کامل کمک کند." },
                    { "title": "۵. مسترینگ صوتی با هوش مصنوعی", "description": "هوش مصنوعی مسترینگ ما میکس شما را تجزیه و تحلیل کرده و EQ، فشرده‌سازی و محدودکنندگی هوشمند را برای بهینه‌سازی بلندی و وضوح برای پلتفرم‌های استریمینگ مانند Spotify و Apple Music اعمال می‌کند." },
                    { "title": "۶. تحلیل روند بازار", "description": "با استناد به دانش خود در جستجوی گوگل، هوش مصنوعی می‌تواند نمودارهای موسیقی و روندهای فعلی را تجزیه و تحلیل کند تا به شما بینش‌هایی در مورد آنچه محبوب است بدهد و به شما در تصمیم‌گیری‌های خلاقانه آگاهانه کمک کند." },
                    { "title": "۷. تخمین هزینه تولید", "description": "هوش مصنوعی می‌تواند یک تفکیک هزینه فرضی برای تولید یک آهنگ، شامل تخمین‌هایی برای زمان استودیو، نوازندگان جلسه، خدمات میکس و مسترینگ، ایجاد کند." },
                    { "title": "۸. مربی تئوری موسیقی", "description": "هوش مصنوعی محاوره‌ای ما به عنوان یک مربی موسیقی عمل می‌کند و قادر است به سوالات شما در مورد تئوری موسیقی، تکنیک‌های تولید و تاریخ موسیقی به روشی واضح و قابل فهم پاسخ دهد." }
                ]
            },
            homePageAdditions: {
                testimonialsTitle: "هنرمندان چه می‌گویند",
                testimonialsSubtitle: "داستان‌های واقعی از خالقانی که تفاوت AURA را تجربه کرده‌اند.",
                testimonials: [
                    { "quote": "مولد ملودی هوش مصنوعی فوق‌العاده است. هفته‌ها روی یک آهنگ گیر کرده بودم و AURA در چند ثانیه هوک عالی را به من داد.", "name": "دی‌جی الکس", "treatment": "تولید ملودی" },
                    { "quote": "AURA گردش کار من را کاملاً متحول کرده است. ابزار مسترینگ هوش مصنوعی صدها دلار برای من صرفه‌جویی کرد و آهنگ‌هایم شگفت‌انگیز به نظر می‌رسند.", "name": "لیلا ک.", "treatment": "مسترینگ با هوش مصنوعی" },
                    { "quote": "به عنوان یک مبتدی، مربی موسیقی هوش مصنوعی یک تغییردهنده بازی بوده است. من بالاخره تئوری موسیقی را می‌فهمم.", "name": "دیوید ل.", "treatment": "مربی موسیقی هوش مصنوعی" }
                ],
                featuredDoctorTitle: "با تهیه‌کننده ارشد ما آشنا شوید",
                featuredDoctorSubtitle: "تیم ما متشکل از پیشکسوتان صنعت و تهیه‌کنندگان برنده‌ی جوایز است.",
                featuredDoctor: {
                    "name": "انوشه",
                    "specialty": "تهیه‌کننده ارشد و طراح صدا",
                    "bio": "انوشه با بیش از ۱۵ سال تجربه در تولید برای هنرمندان بزرگ، پیشگام در ترکیب تکنیک‌های سنتی با ابزارهای پیشرفته هوش مصنوعی است. او به توانمندسازی هنرمندان برای خلق بهترین آثارشان متعهد است."
                },
                featuredDoctorButton: "آشنایی با کل تیم"
            },
        },
        musicSheetGenerator: {
            title: "تولید نت موسیقی با هوش مصنوعی",
            subtitle: "ایده‌های موسیقی خود را به نت‌های خوانا تبدیل کنید. یک ملودی، حالت یا آکورد را توصیف کنید و اجازه دهید هوش مصنوعی نت‌ها را برای شما بنویسد.",
            promptLabel: "ایده موسیقی خود را توصیف کنید",
            promptPlaceholder: "مثال: یک ملودی ساده و شاد محلی در سل ماژور، مناسب برای فلوت.",
            suggestions: [
                "یک والس آرام و غمگین در لا مینور برای پیانو.",
                "یک جیگ سلتیک سریع و پرانرژی.",
                "ملودی 'چشمک بزن ستاره کوچولو'.",
                "یک تم کوتاه و مرموز در دو مینور هارمونیک."
            ],
            buttonText: "تولید نت",
            generating: "در حال تولید...",
            resultsTitle: "نت موسیقی تولید شده",
            abcNotationTitle: "کد نت‌نویسی ABC",
            copyButton: "کپی کد",
            copySuccess: "کپی شد!",
            placeholder: "نت موسیقی تولید شده شما در اینجا نمایش داده می‌شود.",
            error: "متاسفانه نتوانستم برای این ایده نت تولید کنم. لطفا توصیف دیگری را امتحان کنید.",
            engineLabel: "موتور تولید",
            engineMusic21: "Music21",
            engineMusic21Desc: "بهترین انتخاب کلی. برای تجزیه، تحلیل و تولید.",
            engineLilypond: "LilyPond",
            engineLilypondDesc: "بالاترین کیفیت حکاکی برای نت‌های استاندارد انتشار.",
            engineAbjad: "Abjad",
            engineAbjadDesc: "برای آهنگسازی الگوریتمی و نت‌های پیچیده معاصر.",
        },
        myProjectsPage: { title: "پروژه‌های ذخیره شده من", subtitle: "جلسات موسیقی تولید شده با هوش مصنوعی گذشته خود را مرور، بازیابی یا حذف کنید.", restore: "مشاهده پروژه", "delete": "حذف", savedOn: "ذخیره شده در", emptyTitle: "هیچ پروژه‌ای ذخیره نشده است", emptyText: "پروژه‌های موسیقی ذخیره شده شما در اینجا نمایش داده می‌شوند.", goBackButton: "شروع یک پروژه جدید" },
        footer: { description: "دستیار هوش مصنوعی شما برای خلق، تولید و تحلیل موسیقی.", copyright: "© ۲۰۲۴ AURA. تمام حقوق محفوظ است." },
        quotaErrorModal: {
            title: "سهمیه تمام شد",
            body: "شما از سهمیه API خود فراتر رفته‌اید. لطفاً وضعیت صورتحساب خود را بررسی کنید یا بعداً دوباره امتحان کنید. ویژگی‌های هوش مصنوعی به طور موقت در دسترس نیستند.",
            cta: "بررسی صورتحساب",
            close: "بستن",
        },
        loginModal: {
            title: "ورود به استودیوی شما",
            google: "ادامه با گوگل",
            facebook: "ادامه با فیسبوک",
            instagram: "ادامه با اینستاگرام",
            or: "یا",
            emailPlaceholder: "ایمیل خود را وارد کنید",
            passwordPlaceholder: "رمز عبور خود را وارد کنید",
            loginButton: "ورود",
        },
        aiTutor: {
            title: "مربی موسیقی هوش مصنوعی",
            subtitle: "هر چیزی در مورد تئوری موسیقی، تولید یا آهنگسازی از من بپرسید. من اینجا هستم تا در سفر خلاقانه شما به شما کمک کنم.",
            placeholder: "سوال خود را اینجا تایپ کنید...",
        },
        musicTrends: {
            title: "تحلیلگر روندهای بازار موسیقی",
            subtitle: "یک موضوع را برای دریافت آخرین بینش‌های بازار، روندهای ژانر و تحلیل‌های مبتنی بر جستجوی گوگل وارد کنید.",
            searchPlaceholder: "مثال: 'روندهای هیپ هاپ لو-فای در سال ۲۰۲۴'",
            suggestionsTitle: "یا یکی از این موضوعات را امتحان کنید:",
            suggestions: [
                "آینده موسیقی پاپ",
                "ظهور ژانر آمپیانو",
                "تأثیر تیک‌تاک بر چارت‌های موسیقی",
                "روند فروش صفحه‌های وینیل"
            ],
            searching: "در حال تحلیل...",
            searchButton: "تحلیل",
            placeholder: "تحلیل بازار شما در اینجا نمایش داده می‌شود.",
            loading: {
                scanning: "در حال اسکن نتایج جستجو...",
                synthesizing: "در حال ترکیب اطلاعات...",
                extracting: "در حال استخراج بینش‌های کلیدی...",
                compiling: "در حال گردآوری گزارش شما...",
            },
            analysisModes: {
                quick: "خلاصه سریع",
                "in-depth": "تحلیل عمیق",
                swot: "تحلیل SWOT",
            },
            results: {
                keyInsights: "بینش‌های کلیدی",
                detailedSummary: "خلاصه تفصیلی",
                emergingTrends: "روندهای نوظهور",
                opportunities: "فرصت‌ها",
                risks: "ریسک‌ها",
                strengths: "نقاط قوت",
                weaknesses: "نقاط ضعف",
                threats: "تهدیدها",
            },
            sources: "منابع",
            relatedTopics: "موضوعات مرتبط",
        },
        ourProducers: {
            title: "با تهیه‌کنندگان متخصص ما آشنا شوید",
            subtitle: "استودیوی ما مفتخر است که تیمی از تهیه‌کنندگان بسیار ماهر و با تجربه را دارد که به برتری صوتی متعهد هستند.",
            tableHeaders: { "name": "نام", "specialty": "ژانر اصلی", "bio": "بیوگرافی", "license": "برترین آثار" },
            doctors: [
                { "name": "انوشه", "specialty": "سینث‌ویو، الکترونیک", "bio": "متخصص در طراحی صدای سینت آنالوگ و تولید اتمسفریک، با بیش از ۱۵ سال تجربه.", "licenseNumber": "آلبوم Starlight Drive" },
                { "name": "بن کارتر", "specialty": "هیپ‌هاپ، ترپ", "bio": "کارشناس برنامه‌ریزی درام مدرن و تولید مبتنی بر نمونه، با تمرکز بر آهنگ‌های آماده برای رادیو.", "licenseNumber": "تک‌آهنگ City Lights" },
                { "name": "آوا نظری", "specialty": "ارکسترال، موسیقی فیلم", "bio": "متمرکز بر تنظیمات ارکسترال در مقیاس بزرگ و آهنگسازی احساسی برای فیلم و بازی.", "licenseNumber": "موسیقی متن The Last Kingdom" }
            ],
        },
        collaborationPage: {
            title: "همکاری و ارسال آثار به لیبل",
            goalTitle: "هدف ما",
            goalText: "ما به دنبال هنرمندان و همکاران با استعدادی هستیم تا به اکوسیستم خلاق ما بپیوندند. ماموریت ما دموکراتیک کردن دسترسی به ابزارهای تولید حرفه‌ای و فرصت‌های لیبل از طریق فناوری است.",
            canvasTitle: "چشم‌انداز ما",
            canvasItems: {
                "item1": "راه‌اندازی ۱۰ هنرمند جدید در پلتفرم‌های استریمینگ اصلی ظرف ۲ سال.",
                "item2": "توسعه بیشتر مدل‌های تولید موسیقی هوش مصنوعی ما برای ترکیبات غنی‌تر و پیچیده‌تر.",
                "item3": "ادغام ویژگی‌های همکاری هم‌زمان برای تولید مشترک از راه دور.",
                "item4": "ایجاد یک برنامه آموزشی معتبر برای تهیه‌کنندگان موسیقی مشتاق در سراسر جهان."
            },
            statusTitle: "وضعیت فعلی",
            progressLabel: "آماده دریافت آثار",
            statusText: "ما به طور فعال در حال گوش دادن به دموها و به دنبال استعدادهای جدید برای امضای قرارداد با AURA Records هستیم.",
            methodsTitle: "مشارکت کنید",
            crowdfundingTitle: "سرمایه‌گذاری جمعی (آینده)",
            crowdfundingText: "یک کمپین سرمایه‌گذاری جمعی مبتنی بر توکن برای سه‌ماهه چهارم ۲۰۲۴ برنامه‌ریزی شده است تا به جامعه ما اجازه دهد در هنرمندان تحت قرارداد ما سرمایه‌گذاری کنند.",
            buyTokenButton: "به زودی",
            seedTitle: "دموی خود را ارسال کنید",
            seedText: "ما از هنرمندان همه ژانرها استقبال می‌کنیم تا بهترین کارهای خود را برای بررسی توسط تیم A&R ما ارسال کنند. لطفاً دستورالعمل‌های ارسال ما را مرور کرده و از پورتال برای ارسال آهنگ‌های خود استفاده کنید.",
            viewContractButton: "مشاهده دستورالعمل‌های ارسال",
            contactWhatsAppButton: "ارسال از طریق پورتال دمو",
            franchiseTitle: "استودیوی خود را راه‌اندازی کنید",
            franchiseText: "علاقه‌مند به اداره یک استودیوی مجهز به AURA هستید؟ ما در حال گسترش حضور جهانی خود از طریق یک مدل شراکتی هستیم که فناوری پیشرفته هوش مصنوعی ما را با تخصص محلی شما ترکیب می‌کند.",
            franchiseButton: "بررسی شراکت استودیو",
        },
        franchisePage: {
            title: "شریک استودیوی AURA شوید",
            subtitle: "آینده تولید موسیقی با هوش مصنوعی را به شهر خود بیاورید. به شبکه‌ای از نوآوران که صنعت را شکل می‌دهند بپیوندید.",
            canvasTitle: "بوم مدل کسب و کار ما",
            canvasSubtitle: "چارچوبی اثبات‌شده برای موفقیت، با پشتیبانی از فناوری و برند پیشرفته ما.",
            canvasItems: {
                valueProposition: { title: "ارزش پیشنهادی", description: "ابزارهای آهنگسازی مبتنی بر هوش مصنوعی، گردش کار تولید شخصی، برندسازی برتر و دسترسی انحصاری به پلتفرم فناوری ما." },
                targetMarket: { title: "بازار هدف", description: "هنرمندان مستقل، ترانه‌سرایان و تهیه‌کنندگانی که به دنبال راه‌حل‌های تولید موسیقی پیشرفته، کارآمد و خلاق هستند." },
                revenueStreams: { title: "جریان‌های درآمدی", description: "هزینه‌های اشتراک برای ابزارهای هوش مصنوعی، حق امتیاز از آهنگ‌های منتشر شده، و خدمات تولید/میکس برتر." },
                keyResources: { title: "منابع کلیدی", description: "نرم‌افزار هوش مصنوعی اختصاصی، برنامه‌های آموزشی معتبر، دارایی‌های برند، و یک سیستم مدیریت پروژه متمرکز." },
                marketingSupport: { title: "بازاریابی و پشتیبانی", description: "کمپین‌های بازاریابی جهانی، بسته‌های ابزار تبلیغاتی محلی، پشتیبانی عملیاتی، و به‌روزرسانی‌های مداوم فناوری." },
                partnershipModel: { title: "مدل شراکتی", description: "یک شراکت مشترک که در آن ما فناوری و برند را ارائه می‌دهیم و شما برتری عملیاتی محلی را فراهم می‌کنید." }
            },
            teamBuildingTitle: "ساختن تیم تولید شما",
            teamBuildingSubtitle: "ما آموزش جامعی ارائه می‌دهیم تا اطمینان حاصل کنیم تیم شما استانداردهای برتر AURA را برآورده می‌کند.",
            teamRoles: [
                { role: "مدیر استودیو", description: "نظارت بر عملیات روزانه، رزرو مشتریان و رضایت هنرمندان." },
                { role: "تهیه‌کننده / مهندس ارشد", description: "حرفه‌ای خلاق اصلی مسئول جلسات و انجام وظایف تولید پیشرفته." },
                { role: "متخصص موسیقی هوش مصنوعی", description: "مدیریت ابزارهای هوش مصنوعی، داده‌های هنرمندان و تضمین ادغام یکپارچه فناوری در گردش کار." },
                { role: "هماهنگ‌کننده مشتریان", description: "اولین نقطه تماس برای هنرمندان، مدیریت رزروها و جدول زمانی پروژه‌ها." }
            ],
            nextStepsTitle: "سفر شما از اینجا شروع می‌شود",
            nextStepsSubtitle: "اولین قدم را برای داشتن یک استودیوی AURA با تضمین موقعیت خود از طریق توکن شراکت بردارید.",
            tokenPurchaseTitle: "توکن استودیوی خود را تهیه کنید",
            tokenPurchaseDescription: "خرید یک توکن استودیو به شما دسترسی انحصاری به دفترچه سرمایه‌گذاری دقیق ما، یک جلسه یک به یک با تیم توسعه ما، و اولویت بررسی برای منطقه انتخابی شما را می‌دهد. این یک ودیعه کاملاً قابل استرداد است.",
            purchaseButton: "خرید توکن استودیو",
            contactButton: "تماس با تیم ما",
        },
        songIdeaGenerator: {
            title: "تولید ایده آهنگ با هوش مصنوعی",
            subtitle: "یک حالت، تم یا داستان را توصیف کنید تا هوش مصنوعی ما به شما در ساخت یک مفهوم موسیقی کامل کمک کند.",
            descriptionLabel: "ایده خود را توصیف کنید",
            descriptionPlaceholder: "مثال: 'یک آهنگ غمگین در مورد قدم زدن در شهر زیر باران در شب. چیزی شبیه به یک بیت لو-فای هیپ هاپ.'",
            suggestionsTitle: "یا، با یکی از این ایده‌ها شروع کنید:",
            suggestions: [
                "یک آهنگ شاد و فانکی برای یک سفر جاده‌ای تابستانی.",
                "یک قطعه ارکسترال تاریک و سینمایی برای یک صحنه فیلم.",
                "یک بالاد آکوستیک ساده در مورد عشق از دست رفته.",
                "یک قطعه سینث‌ویو پرانرژی به سبک دهه ۸۰ برای رانندگی."
            ],
            analyzing: "در حال تولید...",
            buttonText: "تولید ایده آهنگ",
            placeholder: "مفهوم آهنگ شما در اینجا نمایش داده می‌شود.",
            analysisTitle: "گزارش ایده آهنگ",
            keyCharacteristics: "ویژگی‌های کلیدی",
            recommendedIngredients: "سازهای پیشنهادی",
            ingredientsToAvoid: "سازهایی که باید اجتناب کرد",
            actionableSuggestions: "پیشنهادات تولید",
        },
        instrumentFinder: {
            title: "پیدا کردن تجهیزات و استودیوهای موسیقی",
            subtitle: "نزدیکترین فروشگاه ساز یا استودیوی ضبط را برای نیازهای خود پیدا کنید.",
            "searchPlaceholder": "جستجو بر اساس شهر، ساز، یا نام استودیو...",
            suggestionsTitle: "امتحان کنید:",
            suggestions: [
                "گیتارهای فندر در تهران",
                "استودیوهای ضبط با تجهیزات آنالوگ",
                "سینتی‌سایزرهای قدیمی",
                "درام کیت برای مبتدیان"
            ],
            "searchButtonText": "جستجو",
            "or": "یا",
            "geoSearchButton": "پیدا کردن تجهیزات در نزدیکی من",
            "searching": "در حال جستجو...",
            "placeholder": "نتایج جستجو در اینجا نمایش داده می‌شود.",
            "resultsTitle": "شرکای ما",
            "services": "خدمات ارائه شده",
            "searchTypeLabel": "من به دنبال:",
            "searchTypeClinics": "فروشگاه‌ها",
            "searchTypeDoctors": "استودیوها",
        },
        musicGeneration: { title: "تحلیل جامع با هوش مصنوعی", subtitle: "ایده موسیقی خود را شرح دهید تا هوش مصنوعی ما یک تحلیل خلاقانه عمیق شامل تئوری، تنظیم، تخمین هزینه و موارد دیگر ارائه دهد.", saveButton: "ذخیره پروژه" },
        musicIdeaForm: {
            title: "ایده خود را توصیف کنید",
            symptomsLabel: "حالت، ژانر، تمپو و هر ایده متنی را توصیف کنید.",
            symptomsPlaceholder: "مثال: 'می‌خواهم یک قطعه پیانوی آرام و احساسی در یک گام مینور بسازم. اشعار باید درباره نوستالژی و نگاه به عکس‌های قدیمی باشد.'",
            voiceInputStart: "شروع ورودی صوتی",
            voiceInputStop: "توقف ورودی صوتی",
            detailsTitle: "جزئیات بیشتر (اختیاری)",
            aggravatingFactors: "هنرمندان یا آهنگ‌های مرجع؟",
            alleviatingFactors: "سازهای خاصی برای گنجاندن؟",
            duration: "طول آهنگ هدف؟",
            durationPlaceholder: "مثال: ۳ دقیقه، ۴:۳۰",
            previousTreatments: "نرم‌افزار یا DAW که استفاده می‌کنید؟",
            medications: "ملودی یا اشعار موجود؟",
            buttonText: "دریافت تحلیل جامع",
            validationError: "لطفاً قبل از تحلیل، ایده خود را توصیف کنید.",
            culturalPromptsTitle: "یا، با یکی از این حال و هواها شروع کنید:",
        },
        analysisDisplay: {
            analysisTitle: "تحلیل جامع موسیقی",
            generating: "در حال تحلیل ایده شما با هوش مصنوعی...",
            placeholder1: "تحلیل شما در اینجا نمایش داده می‌شود.",
            placeholder2: "برای شروع فرم را پر کنید.",
            specialistsTitle: "تهیه‌کنندگان پیشنهادی",
            conditionsTitle: "عناصر پیشنهادی آهنگ",
            findSpecialistsButton: "یک تهیه‌کننده در نزدیکی خود پیدا کنید",
            viewDetails: "مشاهده جزئیات",
            hideDetails: "پنهان کردن جزئیات",
            academicAnalysisButton: "دریافت اطلاعات تئوری موسیقی",
            requestResearchButton: "درخواست ویژگی جدید",
            loadingDetails: "در حال بارگذاری جزئیات...",
            loadingAcademicAnalysis: "در حال جستجوی اطلاعات تئوری موسیقی...",
            lowConfidenceFallback: "هوش مصنوعی به این نتایج اطمینان کمی دارد. آنها فقط برای الهام خلاقانه ارائه شده‌اند.",
            treatmentSectionTitle: "مراحل بعدی پیشنهادی هوش مصنوعی",
            lifestyleTitle: "مشاوره تنظیم و تولید",
            songStructureTitle: "ساختار پیشنهادی آهنگ",
            treatmentSuggestionsTitle: "تکنیک‌های اولیه پیشنهادی",
            followUpTitle: "سوالاتی که باید از خود بپرسید",
            prepareSummaryButton: "تهیه خلاصه تولید",
            generatingSummary: "در حال تهیه خلاصه...",
            copySuccess: "کپی شد!",
            skinProfileTitle: "پروفایل آهنگ",
            makeupStyleTitle: "پیشنهاد ژانر و سبک",
            homemadeMaskTitle: "ایده ملودی/شعر تولید شده",
            keyProducts: "عناصر کلیدی",
            ingredients: "عناصر",
            instructions: "دستورالعمل‌ها",
            costAnalysisTitle: "تخمین هزینه تولید با هوش مصنوعی",
            calculatingCosts: "در حال محاسبه هزینه‌ها...",
            calculateCostsButton: "محاسبه هزینه‌های تخمینی",
            tableHeaderItem: "خدمت / آیتم",
            tableHeaderCost: "هزینه تخمینی",
            tableHeaderUnit: "واحد",
            tableHeaderTotal: "جمع کل هزینه تخمینی",
            currency: "دلار",
        },
        treatmentSummary: {
            title: "خلاصه تولید",
            style: "سبک",
            modernDark: "مدرن تیره",
            classicLight: "کلاسیک روشن",
            copyBio: "کپی خلاصه",
            namePlaceholder: "خلاصه پروژه",
            locationPlaceholder: "تولید شده توسط هوش مصنوعی AURA",
        },
        producerFinder: {
            title: "پیدا کردن تهیه‌کننده",
            subtitle: "بر اساس تحلیل شما، در اینجا چند تهیه‌کننده وجود دارد که ممکن است مناسب باشند.",
            maxResults: "حداکثر نتایج",
            finding: "در حال یافتن تهیه‌کنندگان...",
            findButton: "پیدا کردن تهیه‌کنندگان",
            validationError: "ابتدا تحلیل را کامل کنید تا تهیه‌کنندگان مرتبط را پیدا کنید.",
            savedTitle: "تهیه‌کنندگان ذخیره شده",
            clearAll: "پاک کردن همه",
            bio: "بیوگرافی",
            specialty: "ژانر",
            relevance: "ارتباط",
            notesLabel: "یادداشت‌های من",
            notesPlaceholder: "مثال: 'دوشنبه برای میکس ایمیل بزنم.'",
            remove: "حذف",
            crateTitle: "نتایج جستجو",
            crateSubtitle: "تهیه‌کنندگانی را که به آنها علاقه دارید ذخیره کنید.",
            clearCrate: "پاک کردن نتایج",
            rankBy: "مرتب‌سازی بر اساس",
            sort: {
                relevance: "ارتباط",
                city: "شهر",
                name: "نام",
            },
            saved: "ذخیره شد",
            save: "ذخیره",
            parseErrorTitle: "پاسخ هوش مصنوعی قابل خواندن نبود",
            parseErrorSubtitle: "هوش مصنوعی داده‌ها را با فرمت غیرمنتظره‌ای بازگرداند. در اینجا متن خام آمده است:",
            crateEmpty: "تهیه‌کننده‌ای یافت نشد. جستجوی خود را تغییر دهید.",
        }
    },
    ar: {
        header: { home: "الرئيسية", musicGeneration: "تحلیل شامل بالذكاء الاصطناعي", songIdeaGenerator: "مولد أفكار الأغاني بالذكاء الاصطناعي", musicSheetGenerator: "النوتة الموسيقية بالذكاء الاصطناعي", instrumentFinder: " مكتشف الآلات", aiTutor: "مدرس الذكاء الاصطناعي", musicTrends: "اتجاهات الموسيقى", ourProducers: "منتجونا", collaboration: "تعاون", myProjects: "مشاريعي", login: "تسجيل الدخول / اشتراك", logout: "تسجيل الخروج" },
        hero: { 
            title: "استوديو الموسيقى الخاص بك المدعوم بالذكاء الاصطناعي",
            subtitle: "أنشئ الألحان، واحصل على نصائح إنتاج مخصصة، وابحث عن متاجر واستوديوهات الموسيقى المحلية - كل ذلك بمساعدة الذكاء الاصطناعي المتقدم.",
            button1: "ابدأ في إنشاء الموسيقى",
            button2: "تعرف على منتجينا",
            servicesTitle: "خدماتنا الإبداعية",
            services: [
                // ... (other services)
                { "icon": "health", "title": "حالة التطبيق", "description": "جميع الأنظمة تعمل بسلاسة. التطبيق سليم وجاهز للإبداع.", "targetPage": "home" }
            ],
        },
        musicSheetGenerator: {
            title: "مولد النوتة الموسيقية بالذكاء الاصطناعي",
            subtitle: "حوّل أفكارك الموسيقية إلى نوتة موسيقية قابلة للقراءة. صف لحنًا أو حالة مزاجية أو تتابعات وترية، ودع الذكاء الاصطناعي يكتب النوتات لك.",
            promptLabel: "صف فكرتك الموسيقية",
            promptPlaceholder: "مثال: لحن شعبي بسيط وسعيد في سلم صول الكبير، مناسب للفلوت.",
            suggestions: [
                "فالس بطيء وحزين في سلم لا الصغير للبيانو.",
                "جيغ سلتيك سريع وحيوي.",
                "لحن 'تويكل توينكل ليتل ستار'.",
                "مقطوعة قصيرة وغامضة في سلم دو الصغير التوافقي."
            ],
            buttonText: "إنشاء النوتة",
            generating: "جاري الإنشاء...",
            resultsTitle: "النوتة الموسيقية المنشأة",
            abcNotationTitle: "رمز تدوين ABC",
            copyButton: "نسخ الرمز",
            copySuccess: "تم النسخ!",
            placeholder: "ستظهر النوتة الموسيقية التي تم إنشاؤها هنا.",
            error: "عذرًا، لم أتمكن من إنشاء نوتة موسيقية لهذه الفكرة. يرجى تجربة وصف مختلف.",
            engineLabel: "محرك التوليد",
            engineMusic21: "Music21",
            engineMusic21Desc: "الخيار الأفضل بشكل عام. للتحليل والتحليل والتوليد.",
            engineLilypond: "LilyPond",
            engineLilypondDesc: "نقش بأعلى جودة لنتائج بمعايير النشر.",
            engineAbjad: "Abjad",
            engineAbjadDesc: "للتأليف الخوارزمي والنتائج المعاصرة المعقدة.",
        },
        songIdeaGenerator: {
            title: "مولد أفكار الأغاني بالذكاء الاصطناعي",
            subtitle: "صف حالة مزاجية أو موضوعًا أو قصة، وسيساعدك الذكاء الاصطناعي في صياغة مفهوم موسيقي كامل.",
            descriptionLabel: "صف فكرتك",
            descriptionPlaceholder: "مثال: 'أغنية حزينة عن المشي في مدينة تحت المطر ليلاً. شيء يشبه إيقاع لو-فاي هيب هوب.'",
            suggestionsTitle: "أو ابدأ بإحدى هذه الأفكار:",
            suggestions: [
                "مقطوعة موسيقية مبهجة وغير تقليدية لرحلة صيفية على الطريق.",
                "مقطوعة أوركسترالية سينمائية داكنة لمشهد سينمائي.",
                "أغنية صوتية بسيطة عن الحب المفقود.",
                "مقطوعة سينثويف حيوية على طراز الثمانينيات للقيادة."
            ],
            analyzing: "جاري الإنشاء...",
            buttonText: "إنشاء فكرة أغنية",
            placeholder: "سيتم عرض مفهوم أغنيتك هنا.",
            analysisTitle: "تقرير فكرة الأغنية",
            keyCharacteristics: "الخصائص الرئيسية",
            recommendedIngredients: "الآلات الموصى بها",
            ingredientsToAvoid: "الآلات التي يجب تجنبها",
            actionableSuggestions: "اقتراحات الإنتاج",
        },
        instrumentFinder: {
            title: "ابحث عن معدات واستوديوهات الموسيقى",
            subtitle: "حدد موقع أقرب متجر آلات موسيقية أو استوديو تسجيل لتلبية احتياجاتك.",
            "searchPlaceholder": "ابحث حسب المدينة أو الآلة أو اسم الاستوديو...",
            suggestionsTitle: "جرب البحث عن:",
            suggestions: [
                "قيثارات فندر في القاهرة",
                "استوديوهات تسجيل بمعدات تناظرية",
                "آلات سينثسيزر قديمة",
                "مجموعات طبول للمبتدئين"
            ],
            "searchButtonText": "بحث",
            "or": "أو",
            "geoSearchButton": "ابحث عن معدات بالقرب مني",
            "searching": "جاري البحث...",
            "placeholder": "ستظهر نتائج البحث هنا.",
            "resultsTitle": "شركاؤنا",
            "services": "الخدمات المقدمة",
            "searchTypeLabel": "أبحث عن:",
            "searchTypeClinics": "متاجر",
            "searchTypeDoctors": "استوديوهات",
        },
        musicTrends: {
            title: "محلل اتجاهات سوق الموسيقى",
            subtitle: "أدخل موضوعًا للحصول على أحدث رؤى السوق واتجاهات الأنواع والتحليلات المدعومة من بحث Google.",
            searchPlaceholder: "مثال: 'اتجاهات الهيب هوب لو-فاي في 2024'",
            suggestionsTitle: "أو جرب أحد هذه المواضيع:",
            suggestions: [
                "مستقبل موسيقى البوب",
                "صعود نوع أمابيانو",
                "تأثير تيك توك على قوائم الموسيقى",
                "اتجاه مبيعات أسطوانات الفينيل"
            ],
            searching: "جاري التحليل...",
            searchButton: "تحليل",
            placeholder: "سيظهر تحليل السوق الخاص بك هنا.",
            loading: {
                scanning: "جارٍ فحص نتائج البحث...",
                synthesizing: "جارٍ تجميع المعلومات...",
                extracting: "جارٍ استخلاص الرؤى الرئيسية...",
                compiling: "جارٍ تجميع تقريرك...",
            },
            analysisModes: {
                quick: "ملخص سريع",
                "in-depth": "تحليل متعمق",
                swot: "تحليل SWOT",
            },
            results: {
                keyInsights: "الرؤى الرئيسية",
                detailedSummary: "ملخص تفصيلي",
                emergingTrends: "الاتجاهات الناشئة",
                opportunities: "الفرص",
                risks: "المخاطر",
                strengths: "نقاط القوة",
                weaknesses: "نقاط الضعف",
                threats: "التهديدات",
            },
            sources: "المصادر",
            relatedTopics: "مواضيع ذات صلة",
        },
        myProjectsPage: { title: "مشاريعي المحفوظة", subtitle: "راجع أو استعد أو احذف جلسات الموسيقى التي تم إنشاؤها بواسطة الذكاء الاصطناعي.", restore: "عرض المشروع", "delete": "حذف", savedOn: "حُفظ في", emptyTitle: "لا توجد مشاريع محفوظة", emptyText: "ستظهر مشاريع الموسيقى المحفوظة هنا.", goBackButton: "بدء مشروع جديد" },
        footer: { description: "مساعدك المدعوم بالذكاء الاصطناعي لإنشاء الموسيقى وإنتاجها وتحليلها.", copyright: "© 2024 AURA. جميع الحقوق محفوظة." },
        musicGeneration: { title: "تحليل شامل بالذكاء الاصطناعي", subtitle: "صف فكرتك الموسيقية، وسيقدم الذكاء الاصطناعي لدينا تحليلًا إبداعيًا عميقًا، بما في ذلك النظرية والترتيب وتقديرات التكلفة والمزيد.", saveButton: "حفظ المشروع" },
        analysisDisplay: {
            currency: "دولار أمريكي",
            costAnalysisTitle: "تقدير تكلفة الإنتاج بواسطة الذكاء الاصطناعي",
            calculatingCosts: "جاري حساب التكاليف...",
            calculateCostsButton: "حساب التكاليف التقديرية",
            tableHeaderItem: "الخدمة / البند",
            tableHeaderCost: "التكلفة التقديرية",
            tableHeaderUnit: "الوحدة",
            tableHeaderTotal: "إجمالي التكلفة التقديرية",
            songStructureTitle: "هيكل الأغنية المقترح",
        }
    }
};

export type Page =
  | 'home'
  | 'music_generation'
  | 'instrument_finder'
  | 'ai_tutor'
  | 'music_trends'
  | 'our_producers'
  | 'collaboration'
  | 'my_projects'
  | 'studio_setup'
  | 'music_sheet_generator'
  | 'song_idea_generator';

export type MusicGenerationEngine = 'music21' | 'lilypond' | 'abjad';

// i18n types
export type Language = 'en' | 'fa' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => any;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fa');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
        document.documentElement.lang = lang;
        document.documentElement.dir = (lang === 'fa' || lang === 'ar') ? 'rtl' : 'ltr';
    }
  };
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
        document.documentElement.dir = (language === 'fa' || language === 'ar') ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }
  }, [language]);


  const t = (key: string): any => {
    // Non-recursive helper to safely access nested properties.
    const getTranslationValue = (obj: any, path: string): any => {
        const keys = path.split('.');
        let result = obj;
        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k];
            } else {
                return undefined;
            }
        }
        return result;
    };

    const currentLangTranslations = translations[language];
    let value = getTranslationValue(currentLangTranslations, key);

    if (value === undefined && language !== 'en') {
        const englishTranslations = translations['en'];
        value = getTranslationValue(englishTranslations, key);
    }
    
    // Fallback if the key is not found in either language
    if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return the key itself as a fallback
    }

    return value;
  };
  
  return React.createElement(LanguageContext.Provider, { value: { language, setLanguage, t } }, children);
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// --- App-specific types ---

export interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface MusicIdeaDetails {
    referenceArtists: string;
    specificInstruments: string;
    targetLength: string;
    daw: string;
    existingIdeas: string;
}

export interface GeneratedSongElement {
    name: string;
    description: string;
    relevance: 'High' | 'Medium' | 'Low';
    suggestedStep: string;
    details?: string;
    isLoadingDetails?: boolean;
    detailsError?: string | null;
    furtherReading?: string;
    isLoadingFurtherReading?: boolean;
    furtherReadingError?: string | null;
}

export type SongGenerationResult = {
    disclaimer: string;
    recommendedProducers: string[];
    suggestedSongElements: GeneratedSongElement[];
    songStructure: {
        name: string;
        description: string;
        sections: { part: string, description: string }[];
    };
    arrangementAdvice: string;
    productionTips: { icon: string, title: string, description: string }[];
    songwritingQuestions: string[];
};

export interface ComprehensiveMusicResult {
    songConcept: {
        key: string;
        tempo: string;
        mood: string[];
        suggestedInstruments: string[];
        instrumentsToAvoid: string[];
        productionSuggestions: string[];
    };
    productionConsultation: SongGenerationResult;
    genreSuggestion: {
        styleName: string;
        description: string;
        keyElements: string[];
    };
    melodyIdea: {
        ideaName: string;
        description: string;
        elements: string[];
        instructions: string;
    };
}

export interface SongIdeaResult {
    keyCharacteristics: {
        key: string;
        tempo: string;
        mood: string[];
    };
    recommendedInstruments: string[];
    instrumentsToAvoid: string[];
    productionSuggestions: string[];
}

export interface SavedProject {
    id: string;
    name: string;
    timestamp: number;
    idea: string;
    ideaDetails: MusicIdeaDetails;
    comprehensiveResult: ComprehensiveMusicResult;
}

export interface ProducerProfile {
  id?: string; // Will be added client-side
  name: string;
  specialty: string; // This is the genre
  city: string;
  bio: string;
  licenseNumber?: string; // From static data, not generated
  relevanceScore: number;
  notes?: string;
}

export interface SearchResultItem {
    title: string;
    description: string;
    targetPage: Page;
}

export interface ProviderSearchResult {
    id: string;
    type: 'store' | 'studio';
    name: string;
    description: string;
    services: string[];
    specialty?: string;
    address: string;
    phone: string;
    website: string;
    whatsapp: string;
    distance?: string;
}

export interface Source {
    uri: string;
    title: string;
}

export type MarketAnalysisMode = 'quick' | 'in-depth' | 'swot';

export interface QuickSummary {
    type: 'quick';
    summary: string;
    sources: Source[];
    suggestedQueries: string[];
}

export interface InDepthAnalysis {
    type: 'in-depth';
    keyInsights: string[];
    detailedSummary: string;
    emergingTrends: { name: string; description: string }[];
    opportunities: string[];
    risks: string[];
    sources: Source[];
    suggestedQueries: string[];
}

export interface SWOTAnalysis {
    type: 'swot';
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    sources: Source[];
    suggestedQueries: string[];
}

export type MarketTrendsResult = QuickSummary | InDepthAnalysis | SWOTAnalysis;

export interface CostAnalysisItem {
    name: string;
    estimatedCost: number;
    unit: string;
}

export interface CostAnalysisResult {
    productionCosts: CostAnalysisItem[];
}

// ----- Legacy / Unused Types -----
// These types are from previous app themes and are no longer actively used,
// but are kept to avoid breaking compilation in any un-refactored components.

export interface SkinAnalysisResult {
    skinType: string;
    skinDescription: string;
    keyCharacteristics: string[];
    recommendedIngredients: string[];
    ingredientsToAvoid: string[];
    actionableSuggestions: string[];
}

export interface TreatmentPlan {
  planTitle: string;
  concernSummary: string;
  suggestedTreatments: { icon: string; name: string; description: string; }[];
  disclaimer: string;
}

export interface AftercareInstructions {
    instructions: string[];
    precautions: string[];
}

export interface PreTreatmentPlanItem {
    item: string;
    instruction: string;
}

export interface PreTreatmentPlanResult {
    oneWeekBefore: PreTreatmentPlanItem[];
    oneDayBefore: PreTreatmentPlanItem[];
    dayOfTreatment: PreTreatmentPlanItem[];
}

export interface BaristaStyleResult {
    femaleOutfitUrls: (string | null)[];
    maleOutfitUrls: (string | null)[];
    counterUrls: (string | null)[];
    musicTheme: string;
    isLoadingFemaleOutfits: boolean;
    isLoadingMaleOutfits: boolean;
    isLoadingCounterDesigns: boolean;
}

export interface ChangelogEntry {
    version: string;
    date: string;
    changes: {
        [key in Language]: {
            type: 'new' | 'improvement' | 'fix';
            text: string;
        }[];
    };
}

export type Difficulty = 'easy' | 'hard';
export interface Goal { id: string; title: string; maxPractices: number; }
export interface ConversationAnalysis {
    scores: { empathy: number; clarity: number; confidence: number; respect: number };
    strengths: string;
    areasForImprovement: string;
}
export interface ConversationCoachState {
    chatHistory: Message[];
    isStreaming: boolean;
    isLoadingAnalysis: boolean;
    currentAnalysis: ConversationAnalysis | null;
    error: string | null;
    activeGoal: Goal | null;
    practiceCount: number;
    showPathSelectionScreen: boolean;
    completedScenarios: Record<string, Difficulty[]>;
    activeTrainingPathId: string | null;
    activeScenarioId: string | null;
    activeDifficulty: Difficulty | null;
    pathSuggestions: { pathId: string; reasoning: string }[];
    selectedPartnerId: string | null;
}

export interface TrainingScenario {
    id: string;
    title: Record<Language, string>;
    description: Record<Language, string>;
    easy: { prompt: Record<Language, string>; reward: Record<Language, string> };
    hard: { prompt: Record<Language, string>; reward: Record<Language, string> };
}

export interface TrainingPath {
    id: string;
    title: Record<Language, string>;
    description: Record<Language, string>;
    scenarios: TrainingScenario[];
}

// --- NEW SEARCH TYPES ---
export interface SearchQueryClassification {
  type: 'general_search' | 'provider_search';
  providerType: 'stores' | 'studios' | 'none';
  searchQuery: string;
}

export function isProviderSearchResult(item: any): item is ProviderSearchResult {
    return item && typeof item === 'object' && 'address' in item && 'phone' in item;
}