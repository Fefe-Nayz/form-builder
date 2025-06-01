import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Workflow,
  FileText,
  Eye,
  Database,
  GitBranch,
  Zap,
  Globe,
  Download,
  Settings,
  ChevronRight,
  Play,
  BookOpen,
  Layers,
  Code2,
  Palette,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <Badge variant="secondary" className="mb-4">
              <Workflow className="h-3 w-3 mr-1" />
              Form Builder v1.0
            </Badge>
          </div>
          <h1 className="text-5xl font-bold dark:text-white mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Constructeur de Formulaires Dynamiques
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Créez visuellement des data cards modulaires pour la gestion de
            notes étudiantes avec un système de graphes de paramètres, des
            conditions JSON-Logic et une prévisualisation en temps réel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/graph-builder">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                <Play className="h-5 w-5 mr-2" />
                Démarrer le Graph Builder
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3">
              <BookOpen className="h-5 w-5 mr-2" />
              Documentation
            </Button>
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Workflow className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                Graph Builder Visuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Interface drag-and-drop intuitive pour construire des graphes de
                paramètres avec des nœuds typés et des connexions
                conditionnelles.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <li>
                  Types de paramètres multiples (string, integer, enum,
                  reference, date, boolean)
                </li>
                <li>Connexions avec conditions JSON-Logic</li>
                <li>Interface multi-onglets pour plusieurs métriques</li>
                <li>Validation en temps réel des graphes</li>
              </ul>
              <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400">
                <span className="text-sm font-medium">Voir en action</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-200 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                Prévisualisation Dynamique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Aperçu en temps réel des formulaires générés avec évaluation des
                conditions et rendu fidèle à l&apos;interface finale.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <li>Rendu instantané des changements</li>
                <li>Évaluation JSON-Logic en direct</li>
                <li>Affichage conditionnel des champs</li>
                <li>Validation côté client</li>
              </ul>
              <div className="mt-4 flex items-center text-green-600 dark:text-green-400">
                <span className="text-sm font-medium">Tester maintenant</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-200 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Database className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                Export Base de Données
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Conversion automatique vers format relationnel (Turso/SQLite)
                pour intégration dans l&apos;application réelle.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <li>Format relationnel avec clés étrangères</li>
                <li>Schéma ParamNode hiérarchique</li>
                <li>Exemples d&apos;instances de cartes</li>
                <li>Compatibilité Drizzle ORM</li>
              </ul>
              <div className="mt-4 flex items-center text-purple-600 dark:text-purple-400">
                <span className="text-sm font-medium">En savoir plus</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technology Stack */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Stack Technologique
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Code2 className="h-12 w-12 mx-auto text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">Frontend</h3>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <div>React + Next.js</div>
                  <div>TypeScript</div>
                  <div>Tailwind CSS</div>
                  <div>shadcn/ui</div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Workflow className="h-12 w-12 mx-auto text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">Graph Engine</h3>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <div>React Flow</div>
                  <div>JSON-Logic</div>
                  <div>Zustand</div>
                  <div>Zod Validation</div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Database className="h-12 w-12 mx-auto text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">Backend Ready</h3>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <div>Turso/SQLite</div>
                  <div>Drizzle ORM</div>
                  <div>Hono</div>
                  <div>Bun Runtime</div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Globe className="h-12 w-12 mx-auto text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold mb-2">Localisation</h3>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <div>Français</div>
                  <div>Anglais</div>
                  <div>Templates i18n</div>
                  <div>JSON-based</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Advanced Features */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Fonctionnalités Avancées
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <GitBranch className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Logique Conditionnelle</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Utilisez JSON-Logic pour créer des formulaires adaptatifs
                    avec des champs qui apparaissent dynamiquement selon les
                    sélections précédentes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Layers className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Architecture Modulaire</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Système de ParamNodes réutilisables avec hiérarchie
                    illimitée et types extensibles pour s&apos;adapter à tous
                    vos besoins.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Gestion de Templates</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Créez, dupliquez, modifiez et organisez vos templates avec
                    un système de versioning et d&apos;import/export complet.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Zap className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Performance Optimisée</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Rendu optimisé avec cache côté client, évaluation des
                    conditions en temps réel et interface responsive.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <Settings className="h-6 w-6 text-red-600 dark:text-red-300" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Personnalisation UI</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Templates de titres et descriptions avec variables
                    Handlebars, icônes personnalisables et thèmes adaptatifs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                  <Palette className="h-6 w-6 text-teal-600 dark:text-teal-300" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Design System</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Interface cohérente basée sur shadcn/ui avec support du mode
                    sombre et components réutilisables.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Prêt à créer vos data cards ?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Découvrez la puissance du form builder et créez des formulaires
                dynamiques pour vos applications de gestion de notes étudiantes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/graph-builder">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    <Workflow className="h-5 w-5 mr-2" />
                    Ouvrir Graph Builder
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="px-8">
                  <Download className="h-5 w-5 mr-2" />
                  Télécharger Exemple
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
