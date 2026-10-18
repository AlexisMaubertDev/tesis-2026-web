import MainLayout from "../components/layout/MainLayout";
import PageLayout from "../components/layout/PageLayout";
import BreadcrumbsMenu from "../components/ui/BreadcrumbsMenu";

const COMPONENTES = [
  {
    nombre: "Aplicación web",
    para: "Administrativa y operativa de oficina (Sistemas, Supervisor y Cajero)",
    stack: "React 19 + TypeScript + Vite + Tailwind CSS + MUI + Redux Toolkit",
  },
  {
    nombre: "Aplicación móvil",
    para: "Operativa de calle (Grúa/acarreo y Playa/barreras)",
    stack: "Expo / React Native + TypeScript",
  },
  {
    nombre: "Backend + base de datos",
    para: "API REST común a la web y al móvil",
    stack: "Node.js + Express + Sequelize + MySQL/MariaDB, JWT y bcrypt",
  },
];

const ROLES = [
  {
    rol: "SISTEMAS",
    plataforma: "Web",
    puede:
      "Gestionar usuarios, sucursales, cajas, barreras, grúas, tarifas y auditoría",
  },
  {
    rol: "SUPERVISOR",
    plataforma: "Web",
    puede:
      "Asignar chofer/enganchador a las grúas, supervisar la sucursal, consultar cajas y grúas, autorizar egresos sin cargo",
  },
  {
    rol: "CAJERO",
    plataforma: "Web",
    puede:
      "Abrir y cerrar su turno de caja, buscar el vehículo por patente, registrar el cobro e informar el cierre",
  },
  {
    rol: "PLAYERO",
    plataforma: "Móvil",
    puede:
      "Iniciar y finalizar el turno de barrera, y registrar el ingreso y el egreso de vehículos",
  },
  {
    rol: "GRUERO / Enganchador",
    plataforma: "Móvil",
    puede:
      "Registrar acarreos, cargar los datos y daños del vehículo y consultar el historial",
  },
];

export default function AcercaDe() {
  return (
    <PageLayout>
      <MainLayout>
        <aside className="w-full p-4 text-sm">
          <BreadcrumbsMenu page="Acerca de" />
        </aside>

        <div className="flex flex-col w-full max-w-5xl gap-4 p-4">
          <section className="w-full bg-cerulean-100 rounded shadow p-4">
            <h1 className="text-lg font-bold uppercase">Acerca de ParkControl</h1>
            <p className="mt-3 text-sm">
              ParkControl es un sistema integral para la{" "}
              <strong>
                gestión operativa y administrativa de una playa de acarreo de
                vehículos
              </strong>{" "}
              (grúa, depósito y estacionamiento de infractores).
            </p>
            <p className="mt-3 text-sm">
              Centraliza el ciclo de vida completo de un vehículo acarreado:
              desde que una grúa registra el operativo hasta que el vehículo
              egresa de la playa tras pagar (o con una salida sin cargo
              autorizada). Aporta seguimiento de las operaciones, control de los
              recursos (cajas, barreras y grúas), trazabilidad de cada
              movimiento y reportes.
            </p>
            <p className="mt-3 text-sm">
              Proyecto de tesis 2026.
            </p>
          </section>

          <section className="w-full bg-cerulean-100 rounded shadow p-4">
            <h2 className="text-sm font-bold uppercase text-cerulean-600">
              Componentes de la solución
            </h2>
            <ul className="flex flex-col gap-3 mt-3">
              {COMPONENTES.map((componente) => (
                <li
                  key={componente.nombre}
                  className="flex flex-col gap-1 text-sm border-l-4 border-cerulean-300 pl-3"
                >
                  <span className="font-bold">{componente.nombre}</span>
                  <span>{componente.para}</span>
                  <span className="text-xs text-zinc-600">
                    {componente.stack}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="w-full bg-cerulean-100 rounded shadow p-4 ">
            <h2 className="text-sm font-bold uppercase text-cerulean-600">
              Roles y permisos
            </h2>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-cerulean-200 text-white">
                    <th className="px-2 py-2 rounded-l">Rol</th>
                    <th className="px-2 py-2">Plataforma</th>
                    <th className="px-2 py-2 rounded-r">Qué puede hacer</th>
                  </tr>
                </thead>
                <tbody>
                  {ROLES.map(({ rol, plataforma, puede }) => (
                    <tr key={rol} className="border-b border-cerulean-200">
                      <td className="px-2 py-2 font-bold whitespace-nowrap">
                        {rol}
                      </td>
                      <td className="px-2 py-2">{plataforma}</td>
                      <td className="px-2 py-2">{puede}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </MainLayout>
    </PageLayout>
  );
}
