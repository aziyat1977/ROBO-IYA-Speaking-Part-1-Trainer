import { SlideContent, SlideType } from './types';

const createSlides = (
    topicName: string, 
    emoji: string, 
    startId: number, 
    texts: { q: string, a: string, r: string }
): SlideContent[] => {
    return [
        {
            id: startId,
            topic: topicName,
            topicEmoji: emoji,
            slideType: SlideType.Question,
            text: texts.q,
            visualMode: 0
        },
        {
            id: startId + 1,
            topic: topicName,
            topicEmoji: emoji,
            slideType: SlideType.Answer,
            text: texts.q,
            subText: `A: ${texts.a}`,
            visualMode: 1
        },
        {
            id: startId + 2,
            topic: topicName,
            topicEmoji: emoji,
            slideType: SlideType.Reasoning,
            text: texts.q,
            subText: `A: ${texts.a}\n\nR: ${texts.r}`,
            visualMode: 2
        }
    ];
};

export const ALL_SLIDES: SlideContent[] = [
    ...createSlides('Hometown', '🏛️', 0, {
        q: "What is the most interesting part of your hometown?",
        a: "I’d say the most captivating area is the historic district, which houses several centuries-old landmarks.",
        r: "This is because it offers a stark contrast to the modern, glass-fronted skyscrapers found in the city center."
    }),
    ...createSlides('Mirrors', '🪞', 3, {
        q: "Do you like looking at yourself in the mirror?",
        a: "Generally speaking, I only look in the mirror when it’s strictly necessary for grooming.",
        r: "I wouldn’t describe myself as vain, so I tend to prioritize functionality over constantly monitoring my appearance."
    }),
    ...createSlides('Sitting', '🪑', 6, {
        q: "Do you find it difficult to sit still for long periods?",
        a: "Yes, I’m quite an active individual, so I find a sedentary lifestyle somewhat challenging.",
        r: "Remaining stationary for hours often leads to a lack of concentration and physical stiffness."
    }),
    ...createSlides('Work/Studies', '💼', 9, {
        q: "What is the most challenging part of your current job?",
        a: "At the moment, the most demanding aspect is managing tight deadlines for multiple projects simultaneously.",
        r: "It requires a high level of organizational skill to ensure that the quality of work doesn’t suffer under pressure."
    }),
    ...createSlides('Old Buildings', '🏛️', 12, {
        q: "Should we preserve old buildings in cities?",
        a: "I firmly believe that historical structures are vital to a city’s cultural identity.",
        r: "If we demolish these landmarks, we lose the tangible connection to our architectural heritage."
    }),
    ...createSlides('Coffee & Tea', '☕', 15, {
        q: "Do you prefer drinking coffee or tea in the morning?",
        a: "I’m definitely a coffee enthusiast, as I rely on the caffeine boost to kickstart my productivity.",
        r: "The rich aroma and the ritual of brewing a fresh cup help me transition into a working mindset."
    }),
    ...createSlides('Small Businesses', '🛍️', 18, {
        q: "Do you prefer buying things from big corporations or small local shops?",
        a: "I generally lean towards supporting local boutiques, as I find the products to be more unique and artisanal.",
        r: "This is because small business owners often provide a personalized service that larger chains simply cannot replicate."
    }),
    ...createSlides('Making Lists', '📝', 21, {
        q: "Do you prefer making lists on paper or on your phone?",
        a: "Personally, I lean towards digital lists because they allow for seamless synchronization across all my devices.",
        r: "This is mainly because I’m prone to losing physical scraps of paper, whereas my phone always provides a backup in the cloud."
    }),
    ...createSlides('Stories', '📖', 24, {
        q: "Did you enjoy listening to stories when you were a child?",
        a: "Absolutely, I was quite captivated by the traditional folk tales my grandmother used to narrate before bedtime.",
        r: "I believe those stories were essential for stimulating my imagination and developing my early language skills."
    }),
    ...createSlides('Machines', '💻', 27, {
        q: "What is the most useful machine in your home?",
        a: "Without a doubt, my laptop is the most indispensable piece of equipment I own.",
        r: "It serves as a multi-functional tool that facilitates everything from my professional work to my leisure activities."
    })
];