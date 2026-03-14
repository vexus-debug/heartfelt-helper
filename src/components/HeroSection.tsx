import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import clinicChair from "@/assets/dental-chair.jpg";
import bracesImg from "@/assets/braces-closeup.webp";

const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.4]);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-screen flex items-center bg-background overflow-hidden"
    >
      {/* Background image grid - visible on larger screens */}
      <div className="absolute inset-0 hidden md:block">
        <motion.div
          style={{ y: imageY }}
          className="absolute top-20 right-0 w-[55%] h-[85%]"
        >
          <img
            src={clinicChair}
            alt="Modern dental treatment room at Zoe Care"
            className="w-full h-full object-cover rounded-l-[3rem] opacity-20"
          />
          <motion.div
            style={{ opacity: overlayOpacity }}
            className="absolute inset-0 bg-background rounded-l-[3rem]"
          />
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center pt-28 md:pt-24 pb-16">
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
            <motion.a
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              href="https://wa.me/2347038899828?text=Hello%20Zoe%20Care,%20I%20would%20like%20to%20book%20an%20appointment."
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium transition-shadow duration-300 shadow-ceramic-md hover:shadow-ceramic-lg"
            >
              Book Appointment
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              href="tel:+2347038899828"
              className="px-8 py-4 rounded-full border border-border text-foreground font-medium transition-shadow duration-300 hover:bg-muted hover:shadow-ceramic-md"
            >
              Call Us
            </motion.a>
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

        {/* Mobile image + bento grid for desktop */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-3xl overflow-hidden shadow-ceramic-lg aspect-[3/4]"
            >
              <img
                src={clinicChair}
                alt="Modern dental chair and equipment at Zoe Care Dental Clinic"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </motion.div>
            <div className="flex flex-col gap-3 md:gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="rounded-3xl overflow-hidden shadow-ceramic-lg flex-1 min-h-0"
              >
                <img
                  src={bracesImg}
                  alt="Orthodontic braces treatment at Zoe Care"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="rounded-3xl bg-primary p-4 sm:p-5 md:p-6 flex items-center gap-3 shadow-ceramic-lg cursor-default"
              >
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-primary-foreground/15 flex items-center justify-center shrink-0">
                  <svg className="h-5 w-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <p className="text-primary-foreground font-display font-700 text-base sm:text-lg leading-tight">Open 7 Days</p>
                  <p className="text-primary-foreground/60 text-xs sm:text-sm mt-0.5">
                    Mon–Sat 8:30AM · Sun 2PM
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
