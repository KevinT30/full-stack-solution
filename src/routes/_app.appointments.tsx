import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, ClipboardList, X, Check, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const Route = createFileRoute("/_app/appointments")({
  component: AppointmentsPage,
});

interface AppointmentRow {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "cancelled" | "attended" | "no_show";
  reason: string | null;
  notes: string | null;
  doctor_id: string;
  patient_id: string;
  doctor_name: string;
  patient_name: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  attended: "Asistió",
  no_show: "No asistió",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning/15 text-warning border-warning/30",
  confirmed: "bg-primary/15 text-primary border-primary/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  attended: "bg-success/15 text-success border-success/30",
  no_show: "bg-muted text-muted-foreground border-border",
};

function AppointmentsPage() {
  const { role } = useAuth();
  const [items, setItems] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("id, appointment_date, start_time, end_time, status, reason, notes, doctor_id, patient_id, doctors(full_name), patients(full_name)")
      .order("appointment_date", { ascending: false })
      .order("start_time", { ascending: false });
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

  const updateStatus = async (id: string, status: AppointmentRow["status"]) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Cita marcada como ${STATUS_LABEL[status]}`); load(); }
  };

  const filtered = items.filter((a) => filterStatus === "all" || a.status === filterStatus);

  return (
    <div>
      <PageHeader
        title="Citas"
        description="Gestión completa de citas médicas"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Nueva cita</Button>
            </DialogTrigger>
            <NewAppointmentDialog onSaved={() => { setOpen(false); load(); }} />
          </Dialog>
        }
      />

      <div className="mb-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full max-w-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
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
            <p className="mt-2 text-sm text-muted-foreground">Sin citas registradas</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <div className="text-xs font-bold">
                    {format(new Date(a.appointment_date + "T00:00:00"), "MMM", { locale: es }).toUpperCase()}
                  </div>
                  <div className="text-lg font-bold leading-none">
                    {format(new Date(a.appointment_date + "T00:00:00"), "d")}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">
                    {a.patient_name} <span className="text-muted-foreground">→</span> {a.doctor_name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {a.start_time.slice(0, 5)} – {a.end_time.slice(0, 5)} · {a.reason ?? "Sin motivo"}
                  </div>
                </div>
                <Badge className={STATUS_COLORS[a.status] + " border"}>{STATUS_LABEL[a.status]}</Badge>
                {(role === "admin" || role === "doctor") && a.status !== "attended" && a.status !== "no_show" && (
                  <div className="flex gap-1">
                    {a.status !== "confirmed" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, "confirmed")}>
                        Confirmar
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, "attended")}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, "cancelled")}>
                      <X className="h-3.5 w-3.5" />
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

function NewAppointmentDialog({ onSaved }: { onSaved: () => void }) {
  const { role, user } = useAuth();
  const [doctors, setDoctors] = useState<Array<{ id: string; full_name: string; specialty: string; consultation_duration_min: number }>>([]);
  const [patients, setPatients] = useState<Array<{ id: string; full_name: string }>>([]);
  const [form, setForm] = useState({
    doctor_id: "",
    patient_id: "",
    appointment_date: format(new Date(), "yyyy-MM-dd"),
    start_time: "09:00",
    reason: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: d }, { data: p }] = await Promise.all([
        supabase.from("doctors").select("id, full_name, specialty, consultation_duration_min").eq("active", true).order("full_name"),
        supabase.from("patients").select("id, full_name").order("full_name"),
      ]);
      setDoctors(d ?? []);
      setPatients(p ?? []);
      // If patient role, preselect own record
      if (role === "patient" && user) {
        const { data: own } = await supabase.from("patients").select("id").eq("user_id", user.id).maybeSingle();
        if (own) setForm((f) => ({ ...f, patient_id: own.id }));
      }
    })();
  }, [role, user]);

  const selectedDoctor = useMemo(() => doctors.find((d) => d.id === form.doctor_id), [doctors, form.doctor_id]);

  const computeEnd = (start: string, durationMin: number) => {
    const [h, m] = start.split(":").map(Number);
    const total = h * 60 + m + durationMin;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.doctor_id || !form.patient_id) return toast.error("Selecciona médico y paciente");
    setBusy(true);
    const duration = selectedDoctor?.consultation_duration_min ?? 30;
    const end_time = computeEnd(form.start_time, duration);

    // Conflict check (RF8: visualize availability)
    const { data: conflicts } = await supabase
      .from("appointments")
      .select("id")
      .eq("doctor_id", form.doctor_id)
      .eq("appointment_date", form.appointment_date)
      .neq("status", "cancelled")
      .lt("start_time", end_time)
      .gt("end_time", form.start_time);

    if (conflicts && conflicts.length > 0) {
      setBusy(false);
      return toast.error("El médico ya tiene una cita en ese horario");
    }

    const { error } = await supabase.from("appointments").insert({
      doctor_id: form.doctor_id,
      patient_id: form.patient_id,
      appointment_date: form.appointment_date,
      start_time: form.start_time,
      end_time,
      reason: form.reason || null,
      notes: form.notes || null,
      status: "pending",
      created_by: user?.id,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Cita creada"); onSaved(); }
  };

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Nueva cita</DialogTitle>
        <DialogDescription>Programa una consulta médica</DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <Label>Médico *</Label>
          <Select value={form.doctor_id} onValueChange={(v) => setForm({ ...form, doctor_id: v })}>
            <SelectTrigger><SelectValue placeholder="Selecciona médico…" /></SelectTrigger>
            <SelectContent>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.full_name} — {d.specialty}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {role !== "patient" && (
          <div>
            <Label>Paciente *</Label>
            <Select value={form.patient_id} onValueChange={(v) => setForm({ ...form, patient_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecciona paciente…" /></SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Fecha *</Label>
            <Input type="date" required value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} />
          </div>
          <div>
            <Label>Hora *</Label>
            <Input type="time" required value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
          </div>
        </div>
        {selectedDoctor && (
          <div className="flex items-center gap-2 rounded-md bg-primary-soft p-2 text-xs text-primary">
            <CalendarClock className="h-4 w-4" />
            Duración: {selectedDoctor.consultation_duration_min} min · Termina a las {computeEnd(form.start_time, selectedDoctor.consultation_duration_min)}
          </div>
        )}
        <div>
          <Label>Motivo</Label>
          <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </div>
        <div>
          <Label>Notas</Label>
          <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={busy}>{busy ? "Creando…" : "Crear cita"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
