"use client";

import { useActionState } from "react";
import { createBooking, type BookingFormState } from "@/app/actions";

type Props = { serviceId: number; date: string; startMin: number };

export function BookingForm({ serviceId, date, startMin }: Props) {
  const [state, action, pending] = useActionState<BookingFormState, FormData>(createBooking, {});
  const errors = state.fieldErrors ?? {};
  const v = state.values ?? {};

  return (
    <form action={action} className="mt-6 space-y-5" noValidate>
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="startMin" value={startMin} />

      {state.message && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {state.message}
        </p>
      )}

      <Field label="Full name" name="name" error={errors.name}>
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          defaultValue={v.name}
          className="input"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" name="email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={v.email}
            className="input"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
        </Field>
        <Field label="Phone" name="phone" error={errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+234 801 234 5678"
            required
            defaultValue={v.phone}
            className="input"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
        </Field>
      </div>

      <Field label="Notes (optional)" name="notes" error={errors.notes}>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={500}
          defaultValue={v.notes}
          placeholder="Anything we should know? Hair length, allergies, etc."
          className="input"
          aria-invalid={!!errors.notes}
        />
      </Field>

      <button type="submit" disabled={pending} className="btn-primary w-full py-3 text-base sm:w-auto sm:px-10">
        {pending ? "Confirming…" : "Confirm booking"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
