import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroImage from "@/assets/hero-abstract.png";

const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-screen flex items-center bg-background overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block px-4 py-1.5 rounded-full bg-accent text-sm font-medium text-accent-foreground"
            >
              Asaba's Premier Dental Clinic
            </motion.span>
            <h1 className="heading-clamp font-display font-800 text-foreground leading-[0.95]">
              Precision Care.
              <br />
              <span className="text-primary">Personal Touch.</span>
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
            Specialized maxillofacial and orthodontic excellence in the heart of Asaba. 
            Where advanced dental science meets compassionate care.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://wa.me/2347038899828?text=Hello%20Zoe%20Care,%20I%20would%20like%20to%20book%20an%20appointment."
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium transition-all duration-300 brand-curve press-scale hover:shadow-ceramic-lg animate-pulse-soft"
            >
              Book Appointment
            </a>
            <a
              href="tel:+2347038899828"
              className="px-8 py-4 rounded-full border border-border text-foreground font-medium transition-all duration-300 brand-curve press-scale hover:bg-muted"
            >
              Call Us
            </a>
          </div>
          <div className="flex items-center gap-8 pt-4">
            <div>
              <p className="text-2xl font-display font-700 text-foreground">4.8★</p>
              <p className="text-xs text-muted-foreground">Google Rating</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <p className="text-2xl font-display font-700 text-foreground">10+</p>
              <p className="text-xs text-muted-foreground">Years Experience</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <p className="text-2xl font-display font-700 text-foreground">7</p>
              <p className="text-xs text-muted-foreground">Days Open</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{ scale: imageScale, y: imageY }}
          className="relative flex items-center justify-center"
        >
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            src={heroImage}
            alt="Abstract glass sculpture representing clarity and precision"
            className="w-full max-w-lg mx-auto"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
