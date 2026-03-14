import { motion } from "framer-motion";
import { Accessibility, CreditCard, Smartphone, Award, Shield, Heart, Users } from "lucide-react";
import clinicSignage from "@/assets/clinic-signage.webp";
import dentalChair from "@/assets/dental-chair.jpg";

const stats = [
  { value: "4.8", label: "Google Stars", icon: Award },
  { value: "10+", label: "Years of Practice", icon: Shield },
  { value: "4", label: "Specializations", icon: Heart },
  { value: "5000+", label: "Happy Patients", icon: Users },
];

const features = [
  { icon: Accessibility, label: "Wheelchair Accessible" },
  { icon: CreditCard, label: "Card Payments" },
  { icon: Smartphone, label: "NFC Payments" },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 md:py-32 bg-muted">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-sm font-medium text-accent-foreground">
              About Us
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-700 text-foreground leading-tight">
              Dental excellence,
              <br />
              redefined for Asaba.
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              At Zoe Care Dental Clinic, we believe exceptional dental health begins with trust,
              expertise, and a welcoming environment. Led by the acclaimed Dr. Abimbola, our team
              combines cutting-edge techniques with genuine compassion to deliver transformative results.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              From routine check-ups to complex maxillofacial procedures, every patient receives
              personalized attention in our modern, comfortable facility at 67 Old Anwai Road.
              We're proud to serve Asaba's families and professionals seven days a week.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              {features.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-card shadow-ceramic-sm border border-border"
                >
                  <f.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{f.label}</span>
                </div>
              ))}
            </div>

            {/* Clinic images */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="grid grid-cols-2 gap-3 pt-4"
            >
              <div className="rounded-2xl overflow-hidden aspect-[4/3] shadow-ceramic-md">
                <img
                  src={dentalChair}
                  alt="Our well-equipped dental treatment room"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-[4/3] shadow-ceramic-md">
                <img
                  src={clinicSignage}
                  alt="Zoe Care Dental Clinic signage at our Asaba location"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, duration: 0.6 }}
                  className="p-6 rounded-3xl bg-card shadow-ceramic-md border border-border text-center"
                >
                  <stat.icon className="h-6 w-6 text-primary mx-auto mb-3" />
                  <p className="text-3xl font-display font-800 text-primary">{stat.value}</p>
                  <p className="text-muted-foreground mt-1 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="p-6 rounded-3xl bg-primary text-primary-foreground">
              <p className="text-lg font-display font-600">
                "Friendly, welcoming staff with a truly knowledgeable doctor."
              </p>
              <p className="mt-3 text-sm opacity-80">— Patient Review, Google</p>
            </div>

            {/* Why choose us */}
            <div className="p-6 rounded-3xl bg-card border border-border shadow-ceramic-md space-y-4">
              <h3 className="font-display font-600 text-foreground text-lg">Why Choose Zoe Care?</h3>
              <ul className="space-y-3">
                {[
                  "State-of-the-art dental equipment and sterilization",
                  "Experienced specialists in orthodontics & maxillofacial surgery",
                  "Comfortable, child-friendly environment",
                  "Affordable pricing with flexible payment options",
                  "Emergency dental services available",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="h-5 w-5 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary text-xs">✓</span>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
