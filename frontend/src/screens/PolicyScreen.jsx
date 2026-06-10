import React from 'react';
import SEO from '../components/SEO';
import './policyscreen.css';

const PolicyScreen = ({ embedded = false }) => {
  return (
    <div style={{
        marginTop: embedded ? 0 : "40px",
        padding: embedded ? 0 : "20px",
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.6'
      }}>
      {!embedded && (
        <SEO
          title="Politique de confidentialité & CGV"
          description="Consultez les conditions générales de vente, la politique de confidentialité et les informations légales de Lips Empire by Arielle."
          url="/policy"
        />
      )}
      <h1 className="custom-title">Politique de l'entreprise </h1>

      <section>
        <p>
          Chez Lip’s Empire by Arielle, nous avons à cœur la satisfaction de notre clientèle. Nos produits sont préparés avec soin et expédiés dans des conditions respectant des standards rigoureux de qualité et d’hygiène.
        </p>
        <p>
          Cependant, en raison de la nature de nos produits cosmétiques destinés à un usage personnel et conformément aux bonnes pratiques du secteur ainsi qu’à la Loi sur la protection du consommateur du Québec, les retours et échanges ne sont acceptés que dans des cas bien précis. Cette mesure vise à préserver l’hygiène, assurer la sécurité de nos consommateurs/consommatrices et prévenir tout risque de contamination.
        </p>
      </section>

      <section>
        <h2 style={{ color: "black", fontWeight: "600" }}>Retours et échanges</h2>
        <p><strong>Aucun retour ou échange ne sera accepté</strong> pour un produit ouvert, utilisé ou altéré.</p>
        <p>Retours acceptés uniquement dans les situations suivantes :</p>
        <ul>
          <li>Le produit est endommagé ou défectueux à la réception ;</li>
          <li>Une erreur a été commise dans la commande (mauvais article ou quantité incorrecte).</li>
        </ul>
        <p><strong>Procédure à suivre :</strong></p>
        <p>
          Veuillez nous contacter par courriel à contact@lipsempirebyarielle.store dans un délai de 5 jour ouvrable suivant la réception du colis, en incluant :
        </p>
        <ul>
          <li>Votre numéro de commande ;</li>
          <li>Une description détaillée du problème ;</li>
          <li>Des photos claires du produit et de l’emballage.</li>
        </ul>
        <p><strong>Solutions proposées :</strong></p>
        <ul>
          <li>Le remplacement du produit sans frais ;</li>
          <li>Un remboursement complet si le remplacement est impossible.</li>
        </ul>
      </section>

      <section>
        <h2 style={{ color: "black", fontWeight: "600" }}>Produits non admissibles au retour</h2>
        <p>
          En raison de la nature des produits cosmétiques (gloss, soins des lèvres, etc.), aucun retour n’est possible en cas de changement d’avis, d’allergie personnelle non déclarée, ou d’incompatibilité subjective. Ceci est conforme aux normes en matière d’hygiène et de sécurité des produits de beauté. Vérifiez bien la liste des ingrédients avant de passer votre commande.
        </p>
      </section>

      <section>
        <h2 style={{ color: "black", fontWeight: "600" }}>Colis perdus ou endommagés pendant le transport</h2>
        <p><strong>Avant l’envoi :</strong> Nous sommes responsables de la préparation et de l’expédition sécurisée de votre colis.</p>
        <p><strong>Après l’envoi :</strong> Une fois le colis scanné par notre transporteur (Chit Chats), la responsabilité est partagée avec celui-ci.</p>
        <p>Réclamation possible si :</p>
        <ul>
          <li>Le colis est déclaré perdu ou reçu endommagé ;</li>
          <li>Une assurance a été souscrite lors de la commande ;</li>
          <li>Vous nous contactez dans un délai de 7 jours suivant la réception (ou confirmation de perte), avec photos et preuve de suivi.</li>
        </ul>
        <p>Dans ces cas, nous vous aiderons à déposer une réclamation auprès du transporteur.</p>
      </section>

      <section>
        <h2 style={{ color: "black", fontWeight: "600" }}>Assurance de livraison et responsabilité</h2>
        <p>
          Pour sécuriser votre commande, une assurance de livraison est offerte en option au moment de l’achat. Cette assurance couvre les risques de perte, de vol ou de dommages survenus après que le colis a été pris en charge par notre transporteur.
        </p>
        <p>
          Si vous choisissez de ne pas souscrire à cette assurance, vous acceptez que Lip’s Empire by Arielle ne soit pas responsable des pertes, vols ou dommages subis après l’expédition. Aucun remplacement ou remboursement ne pourra être exigé dans ce cas. Un remboursement partiel pourra être envisagé, à la discrétion de l’entreprise, selon le résultat de la réclamation auprès de l’assurance. Cette condition est clairement présentée au moment du paiement.
        </p>
      </section>

      <section>
        <h2 style={{ color: "black", fontWeight: "600" }}>Frais de livraison</h2>
        <p>
          Les frais de livraison ne sont pas remboursables, sauf si une erreur est commise par notre équipe.
        </p>
        <p>
          En cas de produit défectueux ou non conforme, le remboursement comprendra aussi les frais de livraison initiaux, comme le prévoit la Loi sur la protection du consommateur.
        </p>
      </section>

      <section>
        <h2 style={{ color: "black", fontWeight: "600" }}>Annulation de commande</h2>
        <p>
          Vous pouvez annuler votre commande sans frais dans les cas suivants :
        </p>
        <ul>
          <li>Si aucune date de livraison n’est prévue, et que le produit n’est pas livré dans les 30 jours suivant la date d’achat ;</li>
          <li>Si une date de livraison est convenue, et que cette date est dépassée de manière significative.</li>
        </ul>
        <p>
          Pour annuler, veuillez nous écrire à contact@lipsempirebyarielle.store avant la réception de la commande. Si vous avez déjà été facturé, le remboursement sera effectué dans un délai de 15 jours suivant la réception de votre demande valide.
        </p>
        <p>
          Une fois la commande expédiée, aucune annulation ne sera acceptée en cas de changement d’avis ou sans raison jugée valable (par exemple, une erreur de notre part ou de la part du client). Nous vous encourageons à vérifier attentivement votre commande avant de finaliser votre achat.
        </p>
      </section>

      <section>
        <h2 style={{ color: "black", fontWeight: "600" }}>Confirmation de commande</h2>
        <p>
          Après avoir finalisé votre achat, un courriel de confirmation vous sera automatiquement envoyé à l’adresse courriel fournie lors de la commande.
        </p>
        <p>
          Merci de vérifier votre boîte de réception, ainsi que votre dossier de courriers indésirables (pourriels/spam). Ce courriel contient un récapitulatif de votre commande et confirme que celle-ci a bien été reçue et est en traitement.
        </p>
      </section>

      <section>
        <h2 style={{ color: "black", fontWeight: "600" }}>Erreurs dans les coordonnées</h2>
        <p>
          Le client est responsable de fournir des informations complètes et exactes lors de la commande.
        </p>
        <p>
          Si une erreur d’adresse ou de coordonnées empêche la livraison :
        </p>
        <ul>
          <li>Les frais de réexpédition ou de modification de l’adresse auprès du transporteur sont à la charge du client ;</li>
          <li>Le client sera informé à l’avance des frais applicables, et la commande ne sera modifiée ou réexpédiée qu’après paiement de ces frais.</li>
        </ul>
        <p>
          Si vous avez commis une erreur dans l’adresse avant la confirmation d’expédition, vous pouvez la modifier directement ou contacter Lip’s EMPIRE By Arielle par mail. Merci de préciser votre demande dans l’objet de votre message pour faciliter notre réponse.
        </p>
        <p>
          Si vous préférez un remboursement plutôt qu’une réexpédition, le colis devra être retourné à Lip’s Empire by Arielle. Une fois le colis reçu, un remboursement sera effectué.
        </p>
        <p>
          📌 Des frais d’emballage ou de traitement (3,17 $) pourront être déduits du remboursement si cette politique est mentionnée au moment de la commande.
        </p>
      </section>

      <section>
        <h2 style={{ color: "black", fontWeight: "600" }}>Contact</h2>
        <p>
          Pour toute question ou demande, veuillez contacter notre service à la clientèle à contact@lipsempirebyarielle.store.
        </p>
        <p>
          Nous nous engageons à répondre dans un délai de 48 heure ouvrable.
        </p>
      </section>
    </div>
  );
};

export default PolicyScreen;
