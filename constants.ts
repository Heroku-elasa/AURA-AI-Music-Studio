
import { Language, ChangelogEntry, TrainingPath } from './types';

// This data is generic and does not need to change with the theme.
export const changelogData: ChangelogEntry[] = [
    {
        version: '1.0.0',
        date: '2024-07-26',
        changes: {
            en: [
                { type: 'new', text: 'Initial release of the AURA AI Music Studio platform.' },
                { type: 'improvement', text: 'Enhanced AI analysis for music generation.' },
                { type: 'fix', text: 'Fixed a bug in the login modal.' },
            ],
            fa: [
                { type: 'new', text: 'انتشار اولیه پلتفرم استودیوی موسیقی هوش مصنوعی AURA.' },
                { type: 'improvement', text: 'بهبود تحلیل هوش مصنوعی برای تولید موسیقی.' },
                { type: 'fix', text: 'رفع اشکال در مودال ورود.' },
            ],
            ar: [
                { type: 'new', text: 'الإصدار الأولي لمنصة استوديو الموسيقى AURA AI.' },
                { type: 'improvement', text: 'تحسين تحليل الذكاء الاصطناعي لتوليد الموسيقى.' },
                { type: 'fix', text: 'إصلاح خطأ في نافذة تسجيل الدخول.' },
            ]
        }
    }
];

// This component is not used in the final app, so this data can remain.
export const TRAINING_PATHS: TrainingPath[] = [ /* ... Omitted for brevity ... */ ];

export const PROMPTS = {
    producerFinder: (language: Language) => `
You are an AI assistant for a modern music studio. Your goal is to find relevant music producers based on a user's preliminary AI-driven song analysis.
The user's potential song elements are:
{elements}

The user's primary idea is:
{idea}

Generate a list of {maxResults} hypothetical music producers who would be a good fit to work on this track.
For each producer, create a plausible name, primary genre (e.g., Hip-Hop, Synthwave, Pop), city, and a short, professional bio highlighting their skills.
Most importantly, provide a relevance score as a percentage, briefly explaining why they are a relevant choice based on the user's song idea.

The output must be a markdown table with the following columns: Name, Genre, City, Bio, Relevance.
The table should be in {language}.
`,
};

export const MUSICAL_IDEA_PROMPTS: { [key in Language]: string[] } = {
  en: [
    'A sad, melancholic song about rain, with a simple piano melody.',
    'An upbeat, energetic synthwave track for a night drive.',
    'A funky, groovy bassline-driven track like Vulfpeck.',
    'A dark, atmospheric trap beat with a heavy 808.',
  ],
  fa: [
    'یک آهنگ غمگین و مالیخولیایی در مورد باران، با یک ملودی پیانوی ساده.',
    'یک قطعه سینث‌ویو پرانرژی و شاد برای رانندگی در شب.',
    'یک آهنگ فانکی و جذاب با محوریت بیس‌لاین، شبیه به Vulfpeck.',
    'یک بیت ترپ تاریک و اتمسفریک با 808 سنگین.',
  ],
  ar: [
    'أغنية حزينة وكئيبة عن المطر، مع لحن بيانو بسيط.',
    'مقطوعة سينثويف مفعمة بالحيوية والنشاط للقيادة ليلاً.',
    'مقطوعة فانكي ممتعة تعتمد على خط البيس مثل Vulfpeck.',
    'إيقاع تراب غامض وجوي مع 808 ثقيل.',
  ],
};
