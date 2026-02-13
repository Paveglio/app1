import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const highlights = [
  "Mais de 5.000 empresas atendidas",
  "Integração com prefeituras de todo o Brasil",
  "Suporte especializado e humanizado",
  "Atualizações constantes conforme legislação",
];

const AboutSection = () => {
  return (
    <section id="quem-somos" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">Quem Somos</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-2 mb-6">
              Tecnologia a serviço da sua empresa
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              A MP DEV nasceu com a missão de simplificar a vida de empreendedores brasileiros. 
              Nossa plataforma reúne emissão de notas fiscais, gestão de clientes e controle financeiro 
              em uma única solução moderna, segura e fácil de usar.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Com anos de experiência no mercado fiscal e tributário, entendemos as dores do empreendedor 
              e desenvolvemos ferramentas que realmente fazem a diferença no dia a dia.
            </p>

            <ul className="space-y-3">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-3 text-foreground">
                  <CheckCircle2 size={20} className="text-accent flex-shrink-0" />
                  <span className="text-sm font-medium">{h}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-square max-w-md mx-auto hero-gradient rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="text-center p-8">
                <div className="text-6xl font-display font-extrabold text-primary-foreground mb-2">5K+</div>
                <p className="text-primary-foreground/70 text-lg font-medium">Empresas confiam na MP DEV</p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="glass rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary-foreground">99.9%</div>
                    <p className="text-xs text-primary-foreground/60">Uptime</p>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary-foreground">2M+</div>
                    <p className="text-xs text-primary-foreground/60">Notas emitidas</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

