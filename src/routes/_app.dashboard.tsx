import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  Stethoscope,
  ClipboardList,
  TrendingUp,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

interface Stats {
  todayCount: number;
  weekCount: number;
  patientsCount: number;
  doctorsCount: number;
  upcoming: Array<{
    id: string;
    appointment_date: string;
    start_time: string;
    status: string;
    patient_name: string;
    doctor_name: string;
    reason: string | null;
  }>;
}

function Dashboard() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      const weekEnd = format(weekFromNow, "yyyy-MM-dd");

      const [todayRes, weekRes, patientsRes, doctorsRes, upcomingRes] = await Promise.all([
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("appointment_date", today),
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .gte("appointment_date", today)
          .lte("appointment_date", weekEnd),
        supabase.from("patients").select("id", { count: "exact", head: true }),
        supabase.from("doctors").select("id", { count: "exact", head: true }).eq("active", true),
        supabase
          .from("appointments")
          .select("id, appointment_date, start_time, status, reason, patients(full_name), doctors(full_name)")
          .gte("appointment_date", today)
          .order("appointment_date", { ascending: true })
          .order("start_time", { ascending: true })
          .limit(5),
      ]);

      if (cancel) return;
      setStats({
        todayCount: todayRes.count ?? 0,
        weekCount: weekRes.count ?? 0,
        patientsCount: patientsRes.count ?? 0,
        doctorsCount: doctorsRes.count ?? 0,
        upcoming:
          (upcomingRes.data ?? []).map((a: any) => ({
            id: a.id,
            appointment_date: a.appointment_date,
            start_time: a.start_time,
            status: a.status,
            reason: a.reason,
            patient_name: a.patients?.full_name ?? "—",
            doctor_name: a.doctors?.full_name ?? "—",
          })),
      });
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const greeting =
    role === "admin" ? "Panel de administración" : role === "doctor" ? "Tu consulta hoy" : "Tu salud, organizada";

  return (
    <div>
      <PageHeader
        title={`Hola, ${user?.email?.split("@")[0] ?? ""}`}
        description={greeting}
        actions={
          <Link to="/appointments">
            <Button>Nueva cita</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Calendar} label="Citas hoy" value={loading ? "…" : String(stats?.todayCount ?? 0)} />
        <StatCard icon={TrendingUp} label="Próximos 7 días" value={loading ? "…" : String(stats?.weekCount ?? 0)} />
        <StatCard icon={Users} label="Pacientes" value={loading ? "…" : String(stats?.patientsCount ?? 0)} />
        <StatCard icon={Stethoscope} label="Médicos activos" value={loading ? "…" : String(stats?.doctorsCount ?? 0)} />
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Próximas citas</h2>
          <Link to="/appointments" className="text-sm text-primary hover:underline">
            Ver todas
          </Link>
        </div>
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Cargando…</div>
        ) : stats && stats.upcoming.length > 0 ? (
          <div className="space-y-2">
            {stats.upcoming.map((a) => (
              <div key={a.id} className="flex items-center gap-4 rounded-lg border border-border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium">
                    {a.patient_name} · {a.doctor_name}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{a.reason ?? "Sin motivo especificado"}</div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-medium">
                    {format(new Date(a.appointment_date + "T00:00:00"), "EEE d MMM", { locale: es })}
                  </div>
                  <div className="text-muted-foreground">{a.start_time.slice(0, 5)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">Aún no hay citas programadas</p>
            <Link to="/appointments" className="mt-4 inline-block">
              <Button size="sm" variant="outline">Programar la primera</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 text-3xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
