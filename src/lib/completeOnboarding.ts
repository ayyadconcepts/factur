import { getPendingOnboarding, clearPendingOnboarding } from './pendingOnboarding';

export async function completeOnboarding(): Promise<void> {
  const pending = await getPendingOnboarding();
  if (!pending) return;

  const { name, siret, logo } = pending.company;

  try {
    // 1. Create company
    const createRes = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, siret }),
    });

    if (!createRes.ok) {
      const errorData = await createRes.json().catch(() => ({}));
      // If error is duplicate (HTTP 409 or a specific code), it's fine, we can proceed.
      // But let's check if it's 409 Conflict.
      if (createRes.status !== 409) {
        throw new Error(errorData.error || 'Erreur lors de la création de l\'entreprise.');
      }
    }

    const { id: companyId } = await createRes.json().catch(() => ({ id: null }));

    // 2. Upload logo if exists and companyId is available
    if (logo && companyId) {
      const formData = new FormData();
      formData.append('logo', logo);

      const logoRes = await fetch(`/api/companies/${companyId}/logo`, {
        method: 'POST',
        body: formData, // fetch automatically sets Content-Type to multipart/form-data with boundary
      });

      if (!logoRes.ok) {
        console.error('Échec de l\'upload du logo:', await logoRes.text());
        // We do not throw here to avoid blocking the onboarding loop if the logo fails
      }
    }

    // 3. Clear pending onboarding on success
    await clearPendingOnboarding();
  } catch (error) {
    console.error('Erreur dans completeOnboarding:', error);
    throw error;
  }
}
