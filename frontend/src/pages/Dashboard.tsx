import { FileText, Users, ShoppingCart, Wallet, TrendingUp, TrendingDown } from "lucide-react";

const stats = [
  { label: "Notas Emitidas", value: "128", icon: FileText, trend: "+12%", up: true },
  { label: "Clientes Ativos", value: "84", icon: Users, trend: "+5%", up: true },
  { label: "Vendas do Mes", value: "R$ 45.230", icon: ShoppingCart, trend: "+8%", up: true },
  { label: "A Receber", value: "R$ 12.800", icon: Wallet, trend: "-3%", up: false },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <stat.icon size={20} className="text-accent" />
              </div>
              <span className={`text-xs font-medium flex items-center gap-1 ${stat.up ? "text-accent" : "text-destructive"}`}>
                {stat.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {stat.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Ultimas Notas Emitidas</h3>
          <div className="space-y-3">
            {[
              { num: "NFS-e 001234", client: "Joao Silva", value: "R$ 1.500,00", status: "Emitida" },
              { num: "NFS-e 001233", client: "Maria Santos", value: "R$ 3.200,00", status: "Emitida" },
              { num: "NF-e 005678", client: "Empresa XYZ", value: "R$ 8.750,00", status: "Pendente" },
            ].map((nota) => (
              <div key={nota.num} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{nota.num}</p>
                  <p className="text-xs text-muted-foreground">{nota.client}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{nota.value}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${nota.status === "Emitida" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                    {nota.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            {[
              { action: "Nota NFS-e 001234 emitida", time: "Ha 2 horas" },
              { action: "Cliente Joao Silva cadastrado", time: "Ha 5 horas" },
              { action: "Pagamento de R$ 3.200 recebido", time: "Ha 1 dia" },
              { action: "Servico 'Consultoria' adicionado", time: "Ha 2 dias" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
