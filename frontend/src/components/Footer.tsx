import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="hero-gradient py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <span className="font-display text-xl font-bold text-primary-foreground">
              MP <span className="text-gradient">DEV</span>
            </span>
            <p className="text-sm text-primary-foreground/60 mt-3 leading-relaxed">
              Simplificando a gestão empresarial e fiscal para empreendedores brasileiros.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground mb-3 text-sm">Produto</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><a href="#funcionalidades" className="hover:text-primary-foreground transition-colors">Funcionalidades</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Preços</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Integrações</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground mb-3 text-sm">Empresa</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><a href="#quem-somos" className="hover:text-primary-foreground transition-colors">Quem Somos</a></li>
              <li><a href="#contato" className="hover:text-primary-foreground transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">LGPD</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-6 text-center">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} MP DEV. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

