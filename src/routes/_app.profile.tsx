import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, role } = useAuth();
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setForm({ full_name: data.full_name ?? "", phone: data.phone ?? "" });
      setLoading(false);
    });
  }, [user]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      phone: form.phone || null,
    }).eq("id", user.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Perfil actualizado");
  };

  return (
    <div className="max-w-xl">
      <PageHeader title="Mi perfil" description="Edita tu información personal" />
      <form
        onSubmit={onSubmit}
        className="rounded-xl border border-border bg-card p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div>
          <Label>Correo</Label>
          <Input value={user?.email ?? ""} disabled />
        </div>
        <div>
          <Label>Rol</Label>
          <Input value={role ?? ""} disabled className="capitalize" />
        </div>
        <div>
          <Label>Nombre completo</Label>
          <Input
            required
            disabled={loading}
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </div>
        <div>
          <Label>Teléfono</Label>
          <Input
            disabled={loading}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <Button type="submit" disabled={busy || loading}>
          {busy ? "Guardando…" : "Guardar cambios"}
        </Button>
      </form>
    </div>
  );
}
