import { motion } from "framer-motion";
import { FileText, Users, Briefcase, ShoppingCart, PieChart, Building2 } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Emissão de Notas Fiscais",
    description: "Emita NFS-e e NF-e de forma rápida e segura, com integração direta às prefeituras e SEFAZ.",
  },
  {
    icon: Users,
    title: "Gestão de Clientes",
    description: "Cadastre e gerencie seus clientes com histórico completo de serviços e notas emitidas.",
  },
  {
    icon: Briefcase,
    title: "Controle de Serviços",
    description: "Organize seus serviços, preços e categorias para agilizar a emissão de documentos.",
  },
  {
    icon: ShoppingCart,
    title: "Gestão Comercial",
    description: "Notas de comércio, controle de vendas e acompanhamento de pedidos em um painel completo.",
  },
  {
    icon: PieChart,
    title: "Controle Financeiro",
    description: "Acompanhe receitas, despesas e fluxo de caixa com relatórios claros e objetivos.",
  },
  {
    icon: Building2,
    title: "Gestão de Empresas",
    description: "Gerencie múltiplas empresas e filiais em uma única plataforma centralizada.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="funcionalidades" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Funcionalidades</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-2">
            Tudo que você precisa em um só sistema
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Ferramentas poderosas para simplificar a gestão do seu negócio, do faturamento ao controle financeiro.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:border-accent/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg accent-gradient flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon size={24} className="text-accent-foreground" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
