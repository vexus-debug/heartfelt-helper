import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const hours = [
  { day: "Monday", time: "8:30 AM – 7:30 PM" },
  { day: "Tuesday", time: "8:30 AM – 7:30 PM" },
  { day: "Wednesday", time: "8:30 AM – 7:30 PM" },
  { day: "Thursday", time: "8:30 AM – 7:30 PM" },
  { day: "Friday", time: "8:30 AM – 7:30 PM" },
  { day: "Saturday", time: "8:30 AM – 7:30 PM" },
  { day: "Sunday", time: "2:00 PM – 6:00 PM" },
];

const ContactSection = () => {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <section id="contact" className="py-24 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 space-y-4"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-sm font-medium text-accent-foreground">
            Get In Touch
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-700 text-foreground leading-tight">
            Visit us today.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl overflow-hidden border border-border shadow-ceramic-md md:row-span-1"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.0!2d6.73!3d6.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1043f3!2sZoe+Care+Dental+Clinic!5e0!3m2!1sen!2sng!4v1"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "300px", filter: "grayscale(1) contrast(1.1)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Zoe Care Dental Clinic Location"
            />
          </motion.div>

          {/* Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="p-8 rounded-3xl bg-card border border-border shadow-ceramic-md"
          >
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-display font-600 text-foreground">Operating Hours</h3>
            </div>
            <div className="space-y-3">
              {hours.map((h) => (
                <div
                  key={h.day}
                  className={`flex justify-between items-center py-2 px-3 rounded-xl transition-colors ${
                    h.day === today ? "bg-accent" : ""
                  } ${h.day === "Sunday" ? "text-primary font-medium" : ""}`}
                >
                  <span className="text-sm text-foreground">{h.day}</span>
                  <span className="text-sm font-mono text-muted-foreground">{h.time}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-primary font-medium">
              ✦ Open 7 days a week, including Sundays
            </p>
          </motion.div>

          {/* Contact details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-4"
          >
            <div className="p-6 rounded-3xl bg-card border border-border shadow-ceramic-md space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-2xl bg-accent flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Address</p>
                  <p className="text-muted-foreground text-sm">
                    67 Old Anwai Rd, Isieke,
                    <br />
                    Asaba 320104, Delta, Nigeria
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-2xl bg-accent flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Phone</p>
                  <a
                    href="tel:+2347038899828"
                    className="text-muted-foreground text-sm font-mono hover:text-primary transition-colors"
                  >
                    +234 703 889 9828
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-2xl bg-accent flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Email</p>
                  <a href="mailto:zoecaredentalasaba@gmail.com" className="text-muted-foreground text-sm hover:text-primary transition-colors">zoecaredentalasaba@gmail.com</a>
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/2347038899828?text=Hello%20Zoe%20Care,%20I%20would%20like%20to%20book%20an%20appointment."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full p-4 rounded-3xl bg-whatsapp text-primary-foreground font-medium transition-all duration-300 hover:opacity-90 press-scale"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>

            <a
              href="tel:+2347038899828"
              className="flex items-center justify-center gap-3 w-full p-4 rounded-3xl border border-border bg-card text-foreground font-medium transition-all duration-300 hover:bg-muted press-scale"
            >
              <Phone className="h-5 w-5" />
              Call Now
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
