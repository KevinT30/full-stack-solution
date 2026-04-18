import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  HeartPulse,
  Calendar,
  Users,
  Shield,
  Clock,
  Bell,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "MediCare Pro — Sistema de Gestión de Citas Médicas" },
      {
        name: "description",
        content:
          "Automatiza citas, organiza tu agenda y mejora la experiencia de tus pacientes con MediCare Pro.",
      },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">MediCare Pro</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Iniciar sesión</Button>
            </Link>
            <Link to="/auth" search={{ tab: "signup" }}>
              <Button size="sm">Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-soft)" }}
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                <Stethoscope className="h-3.5 w-3.5" />
                Healthcare System
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Gestiona citas médicas con{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "var(--gradient-primary)" }}
                >
                  precisión clínica
                </span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                MediCare Pro automatiza la asignación de citas, organiza la agenda de tu consultorio
                y mejora la experiencia tanto del personal como del paciente.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/auth" search={{ tab: "signup" }}>
                  <Button size="lg" className="shadow-lg">
                    Crear cuenta gratis
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline">
                    Acceder al sistema
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Autenticación JWT segura
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Respuesta &lt; 2s
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  100% responsive
                </div>
              </div>
            </div>

            {/* Hero card mock */}
            <div className="relative">
              <div
                className="rounded-2xl border border-border bg-card p-6"
                style={{ boxShadow: "var(--shadow-elevated)" }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm font-semibold">Agenda de hoy</div>
                  <div className="text-xs text-muted-foreground">Lunes 18 abr</div>
                </div>
                <div className="space-y-3">
                  {[
                    { time: "09:00", patient: "Ana Rodríguez", reason: "Consulta general", color: "bg-primary" },
                    { time: "10:30", patient: "Luis Gómez", reason: "Control cardiológico", color: "bg-success" },
                    { time: "11:15", patient: "María Torres", reason: "Pediatría", color: "bg-warning" },
                    { time: "14:00", patient: "Carlos Méndez", reason: "Dermatología", color: "bg-primary" },
                  ].map((apt, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <div className={`h-10 w-1 rounded-full ${apt.color}`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{apt.patient}</div>
                        <div className="text-xs text-muted-foreground">{apt.reason}</div>
                      </div>
                      <div className="text-sm font-mono text-muted-foreground">{apt.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Todo lo que tu consultorio necesita
            </h2>
            <p className="mt-4 text-muted-foreground">
              Desde la gestión de pacientes hasta la agenda diaria, en una sola plataforma.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Calendar,
                title: "Citas inteligentes",
                desc: "Crea, modifica y cancela citas con visualización de disponibilidad en tiempo real.",
              },
              {
                icon: Users,
                title: "Gestión de pacientes",
                desc: "Expediente completo: datos personales, alergias, tipo de sangre e historial médico.",
              },
              {
                icon: Stethoscope,
                title: "Agenda médica",
                desc: "Vista diaria y semanal con filtros por médico y especialidad.",
              },
              {
                icon: Clock,
                title: "Optimización del tiempo",
                desc: "Reduce errores manuales y libera al personal de tareas administrativas.",
              },
              {
                icon: Shield,
                title: "Seguridad clínica",
                desc: "Autenticación JWT, contraseñas encriptadas y control de acceso por roles.",
              },
              {
                icon: Bell,
                title: "Recordatorios",
                desc: "Notifica a tus pacientes y reduce el ausentismo en las citas programadas.",
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">¿Listo para modernizar tu consultorio?</h2>
          <p className="mt-4 opacity-90">
            Crea una cuenta y empieza a gestionar tus citas en minutos.
          </p>
          <div className="mt-8">
            <Link to="/auth" search={{ tab: "signup" }}>
              <Button size="lg" variant="secondary" className="shadow-lg">
                Comenzar ahora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          © 2026 MediCare Pro · Healthcare System · UNAPEC ISO610
        </div>
      </footer>
    </div>
  );
}
