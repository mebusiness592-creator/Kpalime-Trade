export const metadata = { title: 'Politique de confidentialité' };

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 space-y-5 text-white/85 leading-relaxed">
      <h1 className="text-3xl font-bold text-white">Politique de confidentialité</h1>
      <p className="text-sm text-muted">Dernière mise à jour : novembre 2026. Modèle de départ à faire valider juridiquement.</p>
      <h2 className="text-xl font-semibold text-white pt-2">Données collectées</h2>
      <p>Identité et coordonnées (nom, e-mail, téléphone), informations professionnelles, contenus publiés (textes, images), messages échangés via la plateforme et données techniques de connexion.</p>
      <h2 className="text-xl font-semibold text-white pt-2">Utilisation</h2>
      <p>Les données servent à fournir le service, mettre en relation utilisateurs et professionnels, modérer les publications, assurer la sécurité et répondre à vos demandes d’assistance.</p>
      <h2 className="text-xl font-semibold text-white pt-2">Partage</h2>
      <p>Les informations d’une fiche publiée sont publiques. Vos messages ne sont accessibles qu’à vous, au destinataire et à l’administration. Vos données ne sont pas vendues.</p>
      <h2 className="text-xl font-semibold text-white pt-2">Hébergement des images</h2>
      <p>Les images sont stockées chez notre prestataire d’hébergement de médias (Cloudinary).</p>
      <h2 className="text-xl font-semibold text-white pt-2">Vos droits</h2>
      <p>Vous pouvez demander l’accès, la rectification ou la suppression de vos données via l’assistance de votre espace.</p>
    </article>
  );
}
