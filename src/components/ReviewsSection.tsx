import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Chioma A.",
    rating: 5,
    text: "Friendly, welcoming staff with a truly knowledgeable doctor. The clinic is spotless and modern. Highly recommend!",
    date: "2 weeks ago",
  },
  {
    name: "Emeka O.",
    rating: 5,
    text: "Dr. Abimbola is exceptional. Had my braces fitted here and the entire process was painless and professional.",
    date: "1 month ago",
  },
  {
    name: "Blessing I.",
    rating: 5,
    text: "Best dental clinic in Asaba. They took care of my daughter's tooth extraction with so much patience and care.",
    date: "3 weeks ago",
  },
  {
    name: "Tunde M.",
    rating: 4,
    text: "Great experience with my root canal treatment. The facility is well-equipped and the team is very reassuring.",
    date: "1 month ago",
  },
  {
    name: "Ngozi E.",
    rating: 5,
    text: "I love that they're open seven days a week. The teeth whitening result was amazing — I can't stop smiling!",
    date: "2 months ago",
  },
  {
    name: "David U.",
    rating: 5,
    text: "Very professional and affordable. The consultation was thorough and they explained everything clearly.",
    date: "3 months ago",
  },
];

const ReviewsSection = () => {
  return (
    <section className="py-24 md:py-32 bg-muted/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14 space-y-4"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-sm font-medium text-accent-foreground">
            Patient Reviews
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
            What our patients say.
          </h2>
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-lg font-display font-bold text-foreground">4.8</span>
            <span className="text-muted-foreground text-sm">on Google</span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="p-6 rounded-3xl bg-card border border-border shadow-ceramic-sm hover:shadow-ceramic-md transition-shadow duration-300"
            >
              <div className="flex items-center gap-1 mb-3">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
                {[...Array(5 - review.rating)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 text-border" />
                ))}
              </div>
              <p className="text-foreground text-sm leading-relaxed mb-4">
                "{review.text}"
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{review.name}</p>
                <p className="text-xs text-muted-foreground">{review.date}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center mt-10"
        >
          <a
            href="https://www.google.com/maps/place/Zoe+Care+Dental+Clinic"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card transition-all duration-200 press-scale"
          >
            See all reviews on Google
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ReviewsSection;
