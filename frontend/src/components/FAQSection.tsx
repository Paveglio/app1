import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Como funciona a emissão de notas fiscais?",
    a: "Nossa plataforma se integra diretamente com os sistemas das prefeituras (NFS-e) e SEFAZ (NF-e). Basta preencher os dados do serviço ou produto e clicar em emitir. O XML e PDF são gerados automaticamente.",
  },
  {
    q: "O sistema funciona para qualquer cidade?",
    a: "Sim! Temos integração com centenas de prefeituras em todo o Brasil. Caso sua cidade ainda não esteja integrada, nossa equipe faz a integração em poucos dias.",
  },
  {
    q: "Preciso instalar algo no meu computador?",
    a: "Não. O MP DEV é 100% online e funciona em qualquer navegador, seja no computador, tablet ou celular.",
  },
  {
    q: "Qual o custo para usar a plataforma?",
    a: "Oferecemos planos a partir de R$ 49,90/mês, com opções para MEI, pequenas e médias empresas. Consulte nossa página de preços para mais detalhes.",
  },
  {
    q: "Os meus dados estão seguros?",
    a: "Absolutamente. Utilizamos criptografia de ponta a ponta, servidores redundantes e backups diários. Seus dados fiscais estão protegidos com os mais altos padrões de segurança.",
  },
  {
    q: "Como funciona o suporte?",
    a: "Oferecemos suporte via chat, e-mail e telefone em horário comercial. Clientes do plano Premium contam com suporte prioritário e um gerente de conta dedicado.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">FAQ</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-2">
            Perguntas Frequentes
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-accent/30 transition-colors"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;

