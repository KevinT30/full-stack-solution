import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";

export const Route = createFileRoute("/_app/agenda")({
  component: AgendaPage,
});

interface AgendaItem {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  reason: string | null;
  doctor_id: string;
  doctor_name: string;
  patient_name: string;
}

function AgendaPage() {
  const [view, setView] = useState<"day" | "week">("day");
  const [date, setDate] = useState(new Date());
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [doctors, setDoctors] = useState<Array<{ id: string; full_name: string }>>([]);
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("doctors").select("id, full_name").eq("active", true).order("full_name").then(({ data }) => {
      setDoctors(data ?? []);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const start = view === "week" ? startOfWeek(date, { weekStartsOn: 1 }) : date;
    const end = view === "week" ? addDays(start, 6) : date;
    let q = supabase
      .from("appointments")
      .select("id, appointment_date, start_time, end_time, status, reason, doctor_id, doctors(full_name), patients(full_name)")
      .gte("appointment_date", format(start, "yyyy-MM-dd"))
      .lte("appointment_date", format(end, "yyyy-MM-dd"))
      .order("appointment_date")
      .order("start_time");
    if (doctorFilter !== "all") q = q.eq("doctor_id", doctorFilter);

    q.then(({ data, error }) => {
      if (!error)
        setItems(
          (data ?? []).map((a: any) => ({
            ...a,
            doctor_name: a.doctors?.full_name ?? "—",
            patient_name: a.patients?.full_name ?? "—",
          }))
        );
      setLoading(false);
    });
  }, [view, date, doctorFilter]);

  const navigate = (dir: -1 | 1) => {
    setDate((d) => addDays(d, view === "week" ? dir * 7 : dir));
  };

  const days = view === "week"
    ? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(date, { weekStartsOn: 1 }), i))
    : [date];

  return (
    <div>
      <PageHeader title="Agenda médica" description="Vista diaria y semanal con filtros" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week")}>
          <TabsList>
            <TabsTrigger value="day">Día</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>Hoy</Button>
          <Button variant="outline" size="icon" onClick={() => navigate(1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="font-medium">
          {view === "week"
            ? `Semana del ${format(startOfWeek(date, { weekStartsOn: 1 }), "d MMM", { locale: es })}`
            : format(date, "EEEE d 'de' MMMM yyyy", { locale: es })}
        </div>
        <div className="ml-auto">
          <Select value={doctorFilter} onValueChange={setDoctorFilter}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los médicos</SelectItem>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">Cargando agenda…</div>
      ) : (
        <div className={view === "week" ? "grid gap-3 md:grid-cols-7" : ""}>
          {days.map((d) => {
            const ds = format(d, "yyyy-MM-dd");
            const dayItems = items.filter((i) => i.appointment_date === ds);
            return (
              <div key={ds} className="rounded-xl border border-border bg-card p-3" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="mb-2 border-b border-border pb-2">
                  <div className="text-xs uppercase text-muted-foreground">{format(d, "EEEE", { locale: es })}</div>
                  <div className="text-lg font-bold">{format(d, "d MMM", { locale: es })}</div>
                </div>
                {dayItems.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">Sin citas</div>
                ) : (
                  <div className="space-y-2">
                    {dayItems.map((a) => (
                      <div key={a.id} className="rounded-md border border-border p-2 text-xs">
                        <div className="font-mono text-primary">{a.start_time.slice(0, 5)} – {a.end_time.slice(0, 5)}</div>
                        <div className="font-medium truncate">{a.patient_name}</div>
                        <div className="text-muted-foreground truncate">{a.doctor_name}</div>
                        {a.reason && <div className="mt-1 text-muted-foreground truncate">{a.reason}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
