import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_app/history")({
  component: HistoryPage,
});

interface HistItem {
  id: string;
  appointment_date: string;
  start_time: string;
  status: string;
  reason: string | null;
  doctor_name: string;
  patient_name: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente", confirmed: "Confirmada", cancelled: "Cancelada",
  attended: "Asistió", no_show: "No asistió",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning/15 text-warning border-warning/30",
  confirmed: "bg-primary/15 text-primary border-primary/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  attended: "bg-success/15 text-success border-success/30",
  no_show: "bg-muted text-muted-foreground border-border",
};

function HistoryPage() {
  const { role } = useAuth();
  const [items, setItems] = useState<HistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const today = format(new Date(), "yyyy-MM-dd");
    const { data, error } = await supabase
      .from("appointments")
      .select("id, appointment_date, start_time, status, reason, doctors(full_name), patients(full_name)")
      .lte("appointment_date", today)
      .order("appointment_date", { ascending: false })
      .order("start_time", { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    else
      setItems(
        (data ?? []).map((a: any) => ({
          ...a,
          doctor_name: a.doctors?.full_name ?? "—",
          patient_name: a.patients?.full_name ?? "—",
        }))
      );
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markAttendance = async (id: string, status: "attended" | "no_show") => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Asistencia registrada"); load(); }
  };

  const filtered = items.filter((a) => filter === "all" || a.status === filter);

  return (
    <div>
      <PageHeader title="Historial de citas" description="Consulta y registra asistencia" />

      <div className="mb-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full max-w-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">Sin historial</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="text-xs text-muted-foreground w-28 shrink-0">
                  {format(new Date(a.appointment_date + "T00:00:00"), "d MMM yyyy", { locale: es })}
                  <div className="font-mono">{a.start_time.slice(0, 5)}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{a.patient_name} · {a.doctor_name}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.reason ?? "Sin motivo"}</div>
                </div>
                <Badge className={STATUS_COLORS[a.status] + " border"}>{STATUS_LABEL[a.status]}</Badge>
                {(role === "admin" || role === "doctor") &&
                  (a.status === "pending" || a.status === "confirmed") && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => markAttendance(a.id, "attended")}>
                        <Check className="mr-1 h-3.5 w-3.5" /> Asistió
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => markAttendance(a.id, "no_show")}>
                        <X className="mr-1 h-3.5 w-3.5" /> No asistió
                      </Button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
