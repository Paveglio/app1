import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  ShoppingCart,
  Wallet,
  Settings,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { useLocation } from "react-router-dom";

import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const mainMenu = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Emissao de Notas", url: "/dashboard/notas", icon: FileText },
  { title: "Clientes", url: "/dashboard/clientes", icon: Users },
  { title: "Servicos", url: "/dashboard/servicos", icon: Briefcase },
  { title: "Comercio", url: "/dashboard/comercio", icon: ShoppingCart },
  { title: "Financeiro", url: "/dashboard/financeiro", icon: Wallet },
];

type SimpleItem = {
  title: string;
  url: string;
  icon: typeof Building2;
};

type GroupItem = {
  key: string;
  title: string;
  icon: typeof Users;
  children: Array<{ title: string; url: string }>;
};

const adminMenu: Array<SimpleItem | GroupItem> = [
  {
    key: "usuarios",
    title: "Usuarios",
    icon: Users,
    children: [
      { title: "Incluir", url: "/dashboard/usuarios/incluir" },
      { title: "Consultar", url: "/dashboard/usuarios/consultar" },
    ],
  },
  { title: "Empresas", url: "/dashboard/empresas", icon: Building2 },
  { title: "Configuracoes", url: "/dashboard/configuracoes", icon: Settings },
];

const hasChildren = (item: SimpleItem | GroupItem): item is GroupItem => "children" in item;

const AppSidebar = () => {
  const location = useLocation();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    const activeGroup = adminMenu.find((item) => hasChildren(item) && item.children.some((c) => location.pathname === c.url));

    if (activeGroup && hasChildren(activeGroup)) {
      setOpenGroup(activeGroup.key);
    } else {
      setOpenGroup(null);
    }
  }, [location.pathname]);

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      onClick={() => setOpenGroup(null)}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Administracao</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenu.map((item) => {
                if (hasChildren(item)) {
                  const isOpen = openGroup === item.key;
                  const isActive = item.children.some((child) => child.url === location.pathname);

                  return (
                    <SidebarMenuItem key={item.key}>
                      <Collapsible
                        open={isOpen}
                        onOpenChange={(nextOpen) => setOpenGroup(nextOpen ? item.key : null)}
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton isActive={isActive} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm">
                            <item.icon size={18} />
                            <span>{item.title}</span>
                            <ChevronDown size={16} className={`ml-auto transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="sidebar-submenu-content">
                          <SidebarMenuSub>
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.url}>
                                <SidebarMenuSubButton asChild isActive={location.pathname === child.url}>
                                  <NavLink to={child.url}>{child.title}</NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        onClick={() => setOpenGroup(null)}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon size={18} />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
