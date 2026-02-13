import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const floatingCards = [
  { icon: Shield, label: "Seguro", delay: 0 },
  { icon: Zap, label: "Rápido", delay: 1.5 },
  { icon: BarChart3, label: "Inteligente", delay: 3 },
];

const HeroSection = () => {
  return (
    <section className="relative hero-gradient min-h-[90vh] flex items-center overflow-hidden pt-16">
      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block glass rounded-full px-4 py-1.5 text-sm font-medium text-primary-foreground/80 mb-6">
              ✨ Simplifique sua gestão empresarial
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-6"
          >
            Gerencie sua empresa e emita{" "}
            <span className="text-gradient">notas fiscais</span>{" "}
            com facilidade
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg sm:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10"
          >
            Plataforma completa para emissão de NFS-e e NF-e, gestão de clientes,
            controle de serviços e finanças. Tudo em um só lugar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/login">
              <Button size="lg" className="accent-gradient text-accent-foreground border-0 font-bold text-base px-8 gap-2 shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-shadow">
                Acessar Sistema <ArrowRight size={18} />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.querySelector("#funcionalidades")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-transparent border-primary-foreground/35 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground font-semibold text-base px-8"
            >
              Saiba Mais
            </Button>
          </motion.div>
        </div>

        {/* Floating cards */}
        <div className="hidden lg:flex justify-center gap-6 mt-16">
          {floatingCards.map((card) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 + card.delay * 0.15 }}
              className="glass rounded-xl px-6 py-4 flex items-center gap-3 animate-float"
              style={{ animationDelay: `${card.delay}s` }}
            >
              <card.icon size={22} className="text-accent" />
              <span className="text-sm font-semibold text-primary-foreground">{card.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
