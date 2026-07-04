export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

/** Client feedback sourced from Upwork contracts. */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Zain did a great job fixing the responsiveness issues on our website. He was quick to understand the problem, communicated clearly throughout the process, and delivered exactly what we needed. Highly recommend working with him!",
    name: "Marcus T.",
    role: "Small Business Owner",
  },
  {
    quote:
      "It was a great experience working with Zain. He is very detail-oriented, asks thoughtful questions, and always meets deadlines. His English skills are excellent, and there were absolutely no communication issues. Overall, I'm very happy that I chose Zain for this job and would do so again without hesitation. I wish him all the success and only the best — truly a fantastic person to work with!",
    name: "Sarah L.",
    role: "Marketing Director",
  },
  {
    quote:
      "Again, everything well done. Excellent communication, excellent work. I hired Zain to switch from Divi to Elementor and to rebuild the whole homepage with it. This was the second time I hired him. Will hire him again. I can recommend Zain.",
    name: "Thomas R.",
    role: "Repeat Client · WordPress",
  },
  {
    quote:
      "I've worked with Zain more than once, and each time he has been great. Not only is his English fluent so we don't have communication issues, he is also highly skilled in development. He doesn't just do the work, he offers strategic suggestions and is a great asset to have on any team. I will continue working with him on future projects and highly recommend him!",
    name: "Jennifer K.",
    role: "Startup Founder",
  },
];
