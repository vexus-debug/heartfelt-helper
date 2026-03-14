import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const allServices = [
  // Core specialties
  { id: "orthodontics", name: "Orthodontics (Braces & Aligners)", category: "Specialty" },
  { id: "maxillofacial", name: "Maxillofacial Surgery", category: "Specialty" },
  { id: "periodontics", name: "Periodontics (Gum Treatment)", category: "Specialty" },
  { id: "conservative", name: "Conservative Dentistry", category: "Specialty" },
  // General services
  { id: "cleaning", name: "Teeth Cleaning & Polishing", category: "General" },
  { id: "whitening", name: "Teeth Whitening", category: "General" },
  { id: "filling", name: "Dental Filling", category: "General" },
  { id: "extraction", name: "Tooth Extraction", category: "General" },
  { id: "root-canal", name: "Root Canal Treatment", category: "General" },
  { id: "crown", name: "Dental Crowns & Bridges", category: "General" },
  { id: "dentures", name: "Dentures", category: "General" },
  { id: "implants", name: "Dental Implants", category: "General" },
  { id: "veneers", name: "Veneers", category: "Cosmetic" },
  { id: "bonding", name: "Cosmetic Bonding", category: "Cosmetic" },
  { id: "checkup", name: "General Check-up & Consultation", category: "General" },
  { id: "xray", name: "Dental X-Ray", category: "Diagnostic" },
  { id: "pediatric", name: "Pediatric Dentistry", category: "General" },
  { id: "emergency", name: "Emergency Dental Care", category: "General" },
  { id: "scaling", name: "Scaling & Root Planing", category: "General" },
  { id: "wisdom", name: "Wisdom Tooth Removal", category: "General" },
];

const categories = [...new Set(allServices.map((s) => s.category))];

const ServicesSection = () => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleBook = () => {
    const names = selected
      .map((id) => allServices.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(", ");
    const message = `Hello Zoe Care, I would like to book an appointment for the following services: ${names}. Thank you.`;
    window.open(
      `https://wa.me/2347038899828?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <section id="services" className="py-24 md:py-32 bg-surface-dark text-surface-dark-foreground">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 space-y-4"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium">
            Our Services
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-700 leading-tight">
            Select your services
            <br />
            <span className="text-white/50">& book instantly.</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Choose one or more services below, then book your appointment directly via WhatsApp.
          </p>
        </motion.div>

        {categories.map((cat) => (
          <div key={cat} className="mb-8">
            <p className="text-xs font-medium uppercase tracking-widest text-white/30 mb-4 px-1">
              {cat}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allServices
                .filter((s) => s.category === cat)
                .map((service, i) => {
                  const isSelected = selected.includes(service.id);
                  return (
                    <motion.button
                      key={service.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.03, duration: 0.4 }}
                      onClick={() => toggle(service.id)}
                      className={`flex items-center gap-3 px-5 py-4 rounded-2xl border text-left transition-all duration-200 press-scale ${
                        isSelected
                          ? "bg-primary/20 border-primary/50 text-white"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors duration-200 ${
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-white/20"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <span className="text-sm font-medium">{service.name}</span>
                    </motion.button>
                  );
                })}
            </div>
          </div>
        ))}

        {/* Floating book button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={selected.length > 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="sticky bottom-6 mt-8 flex justify-center"
        >
          <button
            onClick={handleBook}
            disabled={selected.length === 0}
            className="flex items-center gap-3 px-8 py-4 rounded-full bg-whatsapp text-primary-foreground font-medium shadow-ceramic-lg transition-all duration-300 hover:opacity-90 press-scale disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Book {selected.length} Service{selected.length !== 1 ? "s" : ""} via WhatsApp
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
