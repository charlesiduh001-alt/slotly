"use client";

import { useActionState, useEffect, useRef } from "react";
import { adminCreateService, type ServiceFormState } from "@/app/actions";

export function ServiceForm() {
  const [state, action, pending] = useActionState<ServiceFormState, FormData>(adminCreateService, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mt-4 space-y-4">
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="text-sm text-success">
          Service added.
        </p>
      )}
      <div>
        <label htmlFor="name" className="label">Name</label>
        <input id="name" name="name" required maxLength={60} className="input" />
      </div>
      <div>
        <label htmlFor="description" className="label">Description</label>
        <textarea id="description" name="description" required rows={2} maxLength={240} className="input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="durationMin" className="label">Minutes</label>
          <input id="durationMin" name="durationMin" type="number" min={15} max={480} step={15} defaultValue={60} required className="input" />
        </div>
        <div>
          <label htmlFor="priceNaira" className="label">Price (₦)</label>
          <input id="priceNaira" name="priceNaira" type="number" min={0} step={500} required className="input" />
        </div>
      </div>
      <button disabled={pending} className="btn-primary w-full">
        {pending ? "Adding…" : "Add service"}
      </button>
    </form>
  );
}
