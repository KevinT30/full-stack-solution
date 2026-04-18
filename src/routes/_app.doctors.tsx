import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Trash2, Pencil, Stethoscope } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/doctors")({
  component: DoctorsPage,
});

interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
  license_number: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  consultation_duration_min: number;
  active: boolean;
}

function DoctorsPage() {
  const { role } = useAuth();
  const [items, setItems] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [open, setOpen] = useState(false);

  const canEdit = role === "admin";

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("doctors").select("*").order("full_name");
    if (error) toast.error(error.message);
    else setItems((data ?? []) as Doctor[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onDelete = async (id: string) => {
    if (!confirm("¿Eliminar este médico?")) return;
    const { error } = await supabase.from("doctors").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Médico eliminado"); load(); }
  };

  const filtered = items.filter((d) =>
    d.full_name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Médicos"
        description="Catálogo de profesionales y especialidades"
        actions={
          canEdit && (
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditing(null)}>
                  <Plus className="mr-2 h-4 w-4" /> Nuevo médico
                </Button>
              </DialogTrigger>
              <DoctorFormDialog doctor={editing} onSaved={() => { setOpen(false); setEditing(null); load(); }} />
            </Dialog>
          )
        }
      />

      <div className="mb-4 relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por nombre o especialidad…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">Cargando…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Stethoscope className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">Sin médicos</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <div key={d.id} className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Stethoscope className="h-6 w-6" />
                </div>
                {canEdit && (
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setEditing(d)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DoctorFormDialog doctor={d} onSaved={() => load()} />
                    </Dialog>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(d.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="mt-3 font-semibold">{d.full_name}</div>
              <div className="text-sm text-primary">{d.specialty}</div>
              {d.bio && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{d.bio}</p>}
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {d.email && <span>{d.email}</span>}
                {d.phone && <span>{d.phone}</span>}
                <span>{d.consultation_duration_min} min/consulta</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DoctorFormDialog({ doctor, onSaved }: { doctor: Doctor | null; onSaved: () => void }) {
  const [form, setForm] = useState({
    full_name: doctor?.full_name ?? "",
    specialty: doctor?.specialty ?? "",
    license_number: doctor?.license_number ?? "",
    email: doctor?.email ?? "",
    phone: doctor?.phone ?? "",
    bio: doctor?.bio ?? "",
    consultation_duration_min: doctor?.consultation_duration_min ?? 30,
  });
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      full_name: form.full_name,
      specialty: form.specialty,
      license_number: form.license_number || null,
      email: form.email || null,
      phone: form.phone || null,
      bio: form.bio || null,
      consultation_duration_min: Number(form.consultation_duration_min) || 30,
    };
    const { error } = doctor
      ? await supabase.from("doctors").update(payload).eq("id", doctor.id)
      : await supabase.from("doctors").insert(payload);
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success(doctor ? "Médico actualizado" : "Médico creado"); onSaved(); }
  };

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{doctor ? "Editar médico" : "Nuevo médico"}</DialogTitle>
        <DialogDescription>Datos del profesional</DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <Label>Nombre completo *</Label>
          <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        </div>
        <div>
          <Label>Especialidad *</Label>
          <Input required value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Cédula / Licencia</Label>
            <Input value={form.license_number} onChange={(e) => setForm({ ...form, license_number: e.target.value })} />
          </div>
          <div>
            <Label>Duración consulta (min)</Label>
            <Input type="number" min={5} value={form.consultation_duration_min} onChange={(e) => setForm({ ...form, consultation_duration_min: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Correo</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Biografía</Label>
          <Textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
