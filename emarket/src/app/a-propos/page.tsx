import { Building2, Users, Award, Globe } from 'lucide-react';

export const metadata = {
  title: 'À propos - DCAT E-Market',
  description: 'Découvrez DCAT, intégrateur de solutions audiovisuelles, informatiques, domotiques et solaires en Côte d\'Ivoire.',
};

export default function AProposPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">À propos de DCAT</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Digital Communications and All Technologies - Intégrateur de Solutions Audiovisuelles, 
          Informatiques, Domotiques et Solaires depuis 2024
        </p>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Notre Histoire</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Une équipe expérimentée et soudée par M. Cheick Diakité, expert en technologies audiovisuelles, 
            qui affiche 22 ans d&apos;expérience dont 10 passées à la Direction Technique de Canal+ et qui apporte 
            son expertise en visualisation, pré-installation, puis solutions sur mesure pour des clients en 
            Afrique de l&apos;Ouest.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Nous collaborons avec des partenaires prestigieux comme l&apos;Agence de Démocratie Locale, Canal+, 
            ONUCI, HACA (Haute Autorité de la Communication Audiovisuelle), et bien d&apos;autres.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
          <div className="text-gray-600">Projets réalisés</div>
        </div>
        <div className="bg-green-50 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">60+</div>
          <div className="text-gray-600">Clients satisfaits</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-purple-600 mb-2">22</div>
          <div className="text-gray-600">Années d&apos;expérience</div>
        </div>
        <div className="bg-orange-50 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-orange-600 mb-2">17+</div>
          <div className="text-gray-600">Radios FM installées</div>
        </div>
      </div>

      {/* Team */}
      <div className="bg-gray-50 rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Notre Équipe Technique</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900">Ingénieurs Électroniciens</h3>
            <p className="text-sm text-gray-500 mt-2">Expertise en systèmes électroniques</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <Building2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900">Informaticiens</h3>
            <p className="text-sm text-gray-500 mt-2">Solutions logicielles et réseaux</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900">Techniciens Installateurs</h3>
            <p className="text-sm text-gray-500 mt-2">Installation et maintenance</p>
          </div>
        </div>
      </div>

      {/* Expertise */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nos Domaines d&apos;Expertise</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <Globe className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Audiovisuel</h3>
              <p className="text-gray-600 text-sm">TV numérique terrestre, antennes, diffusion, radios FM</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Globe className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Informatique</h3>
              <p className="text-gray-600 text-sm">Réseaux, solutions connectées, multimédia</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Globe className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Domotique</h3>
              <p className="text-gray-600 text-sm">Maisons intelligentes, automatisation</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Globe className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Solaire</h3>
              <p className="text-gray-600 text-sm">Solutions énergétiques durables</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
